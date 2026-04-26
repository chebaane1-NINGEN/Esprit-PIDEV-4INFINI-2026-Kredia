import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { AuditService } from '../services/audit.service';

export const auditInterceptor: HttpInterceptorFn = (req, next) => {
  const auditService = inject(AuditService);
  const startTime = Date.now();

  // Skip audit logging for audit API calls to avoid infinite loops
  if (req.url.includes('/api/audit/')) {
    return next(req);
  }

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type === 4) { // HttpResponse
          logSuccessfulRequest(req, event, startTime, auditService);
        }
      },
      error: (error) => {
        logFailedRequest(req, error, startTime, auditService);
      }
    })
  );
};

function logSuccessfulRequest(request: any, response: any, startTime: number, auditService: AuditService): void {
  const duration = Date.now() - startTime;

  // Determine action type based on HTTP method and URL
  const actionType = determineActionType(request.method, request.url);

  if (actionType) {
    auditService.logAction({
      actionType: actionType,
      status: 'SUCCESS',
      severity: determineSeverity(actionType),
      endpoint: request.url,
      httpMethod: request.method,
      durationMs: duration,
      requestData: sanitizeRequestData(request.body),
      responseData: sanitizeResponseData(response.body),
      changesDescription: generateChangeDescription(actionType, request.body, response.body)
    }).subscribe({
      error: (auditError) => {
        console.error('Failed to log audit action:', auditError);
      }
    });
  }
}

function logFailedRequest(request: any, error: any, startTime: number, auditService: AuditService): void {
  const duration = Date.now() - startTime;
  const actionType = determineActionType(request.method, request.url);

  if (actionType) {
    auditService.logAction({
      actionType: actionType,
      status: 'FAILED',
      severity: determineSeverity(actionType, true),
      endpoint: request.url,
      httpMethod: request.method,
      durationMs: duration,
      requestData: sanitizeRequestData(request.body),
      errorMessage: error.message,
      changesDescription: `Request failed with status ${error.status}: ${error.message}`
    }).subscribe({
      error: (auditError) => {
        console.error('Failed to log audit action:', auditError);
      }
    });
  }
}

function determineActionType(method: string, url: string): string | null {
  const urlLower = url.toLowerCase();

  if (method === 'POST') {
    if (urlLower.includes('/login')) return 'LOGIN';
    if (urlLower.includes('/users')) return 'CREATE_USER';
    if (urlLower.includes('/credit')) return 'CREATE_CREDIT';
    if (urlLower.includes('/transaction')) return 'CREATE_TRANSACTION';
  }

  if (method === 'PUT' || method === 'PATCH') {
    if (urlLower.includes('/users')) return 'UPDATE_USER';
    if (urlLower.includes('/credit')) return 'UPDATE_CREDIT';
    if (urlLower.includes('/transaction')) return 'UPDATE_TRANSACTION';
  }

  if (method === 'DELETE') {
    if (urlLower.includes('/users')) return 'DELETE_USER';
    if (urlLower.includes('/credit')) return 'DELETE_CREDIT';
    if (urlLower.includes('/transaction')) return 'DELETE_TRANSACTION';
  }

  if (method === 'POST' && urlLower.includes('/logout')) {
    return 'LOGOUT';
  }

  return null;
}

function determineSeverity(actionType: string, isError: boolean = false): string {
  if (isError) {
    return actionType.includes('DELETE') ? 'HIGH' : 'MEDIUM';
  }

  if (actionType.includes('DELETE')) return 'HIGH';
  if (actionType.includes('UPDATE')) return 'MEDIUM';
  if (actionType.includes('CREATE')) return 'LOW';
  return 'LOW';
}

function sanitizeRequestData(data: any): any {
  if (!data) return null;

  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key'];
  const sanitized = { ...data };

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

function sanitizeResponseData(data: any): any {
  if (!data) return null;

  // Limit response data size for audit logs
  const dataString = JSON.stringify(data);
  if (dataString.length > 10000) {
    return { message: '[Response data too large for audit log]' };
  }

  return data;
}

function generateChangeDescription(actionType: string, requestData: any, responseData: any): string {
  switch (actionType) {
    case 'CREATE_USER':
      return `Created new user account`;
    case 'UPDATE_USER':
      return `Updated user information`;
    case 'DELETE_USER':
      return `Deleted user account`;
    case 'CREATE_CREDIT':
      return `Created new credit application`;
    case 'UPDATE_CREDIT':
      return `Updated credit application`;
    case 'DELETE_CREDIT':
      return `Deleted credit application`;
    case 'CREATE_TRANSACTION':
      return `Created new transaction`;
    case 'UPDATE_TRANSACTION':
      return `Updated transaction`;
    case 'DELETE_TRANSACTION':
      return `Deleted transaction`;
    case 'LOGIN':
      return `User logged in successfully`;
    case 'LOGOUT':
      return `User logged out`;
    default:
      return `Performed ${actionType.toLowerCase().replace('_', ' ')}`;
  }
}