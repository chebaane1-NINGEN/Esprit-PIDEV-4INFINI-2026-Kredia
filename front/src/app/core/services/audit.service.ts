import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../http/api.config';

export interface AuditLogDTO {
  id: number;
  actionType: string;
  status: string;
  severity: string;
  actorId?: number;
  actorEmail?: string;
  actorName?: string;
  actorRole?: string;
  targetId?: number;
  targetEmail?: string;
  targetType?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  httpMethod?: string;
  requestData?: any;
  responseData?: any;
  previousState?: any;
  newState?: any;
  changesDescription?: string;
  timestamp: string;
  durationMs?: number;
  errorMessage?: string;
  correlationId?: string;
}

export interface AuditLogFilter {
  startDate?: string;
  endDate?: string;
  actionType?: string;
  severity?: string;
  status?: string;
  actorId?: number;
  targetId?: number;
  ipAddress?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface AuditLogSummary {
  totalActionsToday: number;
  failedActionsToday: number;
  highSeverityActionsToday: number;
  actionTypeDistribution: { [key: string]: number };
  severityDistribution: { [key: string]: number };
  mostRecentAction?: AuditLogDTO;
  mostRecentFailure?: AuditLogDTO;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private apiUrl = `${API_BASE_URL}/api/audit`;

  constructor(private http: HttpClient) { }

  getAuditLogs(filter?: AuditLogFilter): Observable<{ content: AuditLogDTO[], totalElements: number, totalPages: number }> {
    let params = new HttpParams();

    if (filter) {
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.actionType) params = params.set('actionType', filter.actionType);
      if (filter.severity) params = params.set('severity', filter.severity);
      if (filter.status) params = params.set('status', filter.status);
      if (filter.actorId) params = params.set('actorId', filter.actorId.toString());
      if (filter.targetId) params = params.set('targetId', filter.targetId.toString());
      if (filter.ipAddress) params = params.set('ipAddress', filter.ipAddress);
      if (filter.page !== undefined) params = params.set('page', filter.page.toString());
      if (filter.pageSize !== undefined) params = params.set('pageSize', filter.pageSize.toString());
      if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
      if (filter.sortDirection) params = params.set('sortDirection', filter.sortDirection);
    }

    return this.http.get<{ content: AuditLogDTO[], totalElements: number, totalPages: number }>(`${this.apiUrl}/logs`, { params });
  }

  getAuditLogById(id: number): Observable<AuditLogDTO> {
    return this.http.get<AuditLogDTO>(`${this.apiUrl}/logs/${id}`);
  }

  getAuditSummary(): Observable<AuditLogSummary> {
    return this.http.get<AuditLogSummary>(`${this.apiUrl}/summary`);
  }

  getHighSeverityActions(page?: number, pageSize?: number): Observable<{ content: AuditLogDTO[], totalElements: number }> {
    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (pageSize !== undefined) params = params.set('pageSize', pageSize.toString());

    return this.http.get<{ content: AuditLogDTO[], totalElements: number }>(`${this.apiUrl}/summary/high-severity`, { params });
  }

  getFailedActions(page?: number, pageSize?: number): Observable<{ content: AuditLogDTO[], totalElements: number }> {
    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (pageSize !== undefined) params = params.set('pageSize', pageSize.toString());

    return this.http.get<{ content: AuditLogDTO[], totalElements: number }>(`${this.apiUrl}/summary/failures`, { params });
  }

  getAuditLogsByActor(actorId: number, page?: number, pageSize?: number): Observable<{ content: AuditLogDTO[], totalElements: number }> {
    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (pageSize !== undefined) params = params.set('pageSize', pageSize.toString());

    return this.http.get<{ content: AuditLogDTO[], totalElements: number }>(`${this.apiUrl}/actor/${actorId}`, { params });
  }

  getAuditLogsByTarget(targetId: number, page?: number, pageSize?: number): Observable<{ content: AuditLogDTO[], totalElements: number }> {
    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (pageSize !== undefined) params = params.set('pageSize', pageSize.toString());

    return this.http.get<{ content: AuditLogDTO[], totalElements: number }>(`${this.apiUrl}/target/${targetId}`, { params });
  }

  logAction(actionData: Partial<AuditLogDTO>): Observable<AuditLogDTO> {
    return this.http.post<AuditLogDTO>(`${this.apiUrl}/log`, actionData);
  }
}