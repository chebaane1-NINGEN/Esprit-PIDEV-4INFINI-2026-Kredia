import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService, AuditLogDTO, AuditLogFilter, AuditLogSummary } from '../../../../core/services/audit.service';

@Component({
  selector: 'app-admin-audit-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-audit-page.component.html',
  styleUrls: ['./admin-audit-page.component.scss']
})
export class AdminAuditPageComponent implements OnInit {
  auditLogs: AuditLogDTO[] = [];
  summary: AuditLogSummary | null = null;
  selectedLog: AuditLogDTO | null = null;
  showModal = false;

  currentPage = 0;
  totalPages = 0;
  totalElements = 0;

  filters: AuditLogFilter = {
    page: 0,
    pageSize: 20,
    sortBy: 'timestamp',
    sortDirection: 'DESC'
  };

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadAuditLogs();
  }

  loadSummary(): void {
    this.auditService.getAuditSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
      },
      error: (error) => {
        console.error('Failed to load audit summary:', error);
      }
    });
  }

  loadAuditLogs(): void {
    this.auditService.getAuditLogs(this.filters).subscribe({
      next: (response) => {
        this.auditLogs = response.content;
        this.currentPage = this.filters.page || 0;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
      },
      error: (error) => {
        console.error('Failed to load audit logs:', error);
        this.auditLogs = [];
      }
    });
  }

  applyFilters(): void {
    this.filters.page = 0; // Reset to first page
    this.loadAuditLogs();
  }

  resetFilters(): void {
    this.filters = {
      page: 0,
      pageSize: 20,
      sortBy: 'timestamp',
      sortDirection: 'DESC'
    };
    this.loadAuditLogs();
  }

  sortBy(field: string): void {
    if (this.filters.sortBy === field) {
      this.filters.sortDirection = this.filters.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.filters.sortBy = field;
      this.filters.sortDirection = 'ASC';
    }
    this.applyFilters();
  }

  goToPage(page: number): void {
    this.filters.page = page;
    this.loadAuditLogs();
  }

  selectLog(log: AuditLogDTO): void {
    this.selectedLog = log;
  }

  viewDetails(log: AuditLogDTO): void {
    this.selectedLog = log;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedLog = null;
  }

  getActionClass(actionType: string): string {
    const actionClasses: { [key: string]: string } = {
      'LOGIN': 'login',
      'LOGOUT': 'logout',
      'CREATE_USER': 'create',
      'UPDATE_USER': 'update',
      'DELETE_USER': 'delete',
      'CREATE_CREDIT': 'create',
      'UPDATE_CREDIT': 'update',
      'DELETE_CREDIT': 'delete',
      'CREATE_TRANSACTION': 'create',
      'UPDATE_TRANSACTION': 'update',
      'DELETE_TRANSACTION': 'delete'
    };
    return actionClasses[actionType] || 'default';
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'SUCCESS': 'success',
      'FAILED': 'failed',
      'PARTIAL': 'partial',
      'PENDING': 'pending'
    };
    return statusClasses[status] || 'default';
  }

  getSeverityClass(severity: string): string {
    const severityClasses: { [key: string]: string } = {
      'LOW': 'low',
      'MEDIUM': 'medium',
      'HIGH': 'high',
      'CRITICAL': 'critical'
    };
    return severityClasses[severity] || 'default';
  }
}
