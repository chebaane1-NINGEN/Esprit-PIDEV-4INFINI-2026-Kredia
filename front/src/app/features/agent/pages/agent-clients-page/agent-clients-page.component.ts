import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AgentApi } from '../../data-access/agent.api';
import { AgentClient } from '../../models/agent.model';
import { PageResponse } from '../../../admin/models/admin.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-clients-page.component.html',
  styleUrl: './agent-clients-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentClientsPageComponent implements OnInit {
  private readonly api = inject(AgentApi);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  clients: AgentClient[] = [];
  loading = true;
  error: string | null = null;
  actionLoadingId: number | null = null;

  // Filters
  searchEmail = '';
  selectedStatuses: string[] = [];
  selectedPriorities: string[] = [];
  availableStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BLOCKED'];
  availablePriorities = ['HIGH', 'MEDIUM', 'LOW'];
  startDate = '';
  endDate = '';
  sortBy = 'priorityScore';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Dropdown states
  statusDropdownOpen = false;
  priorityDropdownOpen = false;

  // Modal states
  showAddClientModal = false;
  showViewClientModal = false;
  showEditClientModal = false;
  addClientLoading = false;
  viewClientLoading = false;
  editClientLoading = false;

  // Selected client for modals
  selectedClient: AgentClient | null = null;

  // New client form
  newClient = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  };

  // Pagination
  currentPage = 0;
  pageSize = 100;
  totalPages = 0;
  totalElements = 0;

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.api.getClients(this.searchEmail || undefined, this.selectedStatuses.length > 0 ? this.selectedStatuses.join(',') : undefined, this.currentPage, this.pageSize, this.sortBy, this.sortDirection, this.startDate || undefined, this.endDate || undefined, this.selectedPriorities.length > 0 ? this.selectedPriorities.join(',') : undefined)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (response: PageResponse<AgentClient>) => {
          this.clients = response.content || [];
          this.totalPages = response.totalPages || 0;
          this.totalElements = response.totalElements || 0;
        },
        error: (err) => {
          console.error('Load clients error:', err);
          if (err.error && err.error.message) {
            this.error = err.error.message;
          } else if (err.status === 403) {
            this.error = 'Access denied. You do not have permission to view clients.';
          } else if (err.status === 404) {
            this.error = 'Clients endpoint not found. Please check the API configuration.';
          } else {
            this.error = 'Failed to load clients. Please try again later.';
          }
        }
      });
  }

  refreshClients(): void {
    this.loadClients();
  }

  clearFilters(): void {
    this.searchEmail = '';
    this.selectedStatuses = [];
    this.selectedPriorities = [];
    this.startDate = '';
    this.endDate = '';
    this.currentPage = 0;
    this.loadClients();
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadClients();
  }

  onStatusFilter(): void {
    this.currentPage = 0;
    this.loadClients();
  }

  onPriorityFilter(): void {
    this.currentPage = 0;
    this.loadClients();
  }

  onDateFilter(): void {
    this.currentPage = 0;
    this.loadClients();
  }

  toggleStatusDropdown(): void {
    this.statusDropdownOpen = !this.statusDropdownOpen;
    this.priorityDropdownOpen = false; // Close other dropdown
  }

  togglePriorityDropdown(): void {
    this.priorityDropdownOpen = !this.priorityDropdownOpen;
    this.statusDropdownOpen = false; // Close other dropdown
  }

  onStatusChange(status: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedStatuses.push(status);
    } else {
      this.selectedStatuses = this.selectedStatuses.filter(s => s !== status);
    }
    this.onStatusFilter();
  }

  onPriorityChange(priority: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedPriorities.push(priority);
    } else {
      this.selectedPriorities = this.selectedPriorities.filter(p => p !== priority);
    }
    this.onPriorityFilter();
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.multi-select')) {
      this.statusDropdownOpen = false;
      this.priorityDropdownOpen = false;
    }
  }

  onSortChange(sortBy: string): void {
    if (this.sortBy === sortBy) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortDirection = 'desc'; // Default to descending for new sort
    }
    this.currentPage = 0;
    this.loadClients();
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadClients();
    }
  }

  viewClientDetails(client: AgentClient): void {
    this.selectedClient = client;
    this.showViewClientModal = true;
    this.cdr.markForCheck();
  }

  editClient(client: AgentClient): void {
    this.selectedClient = { ...client }; // Create a copy for editing
    this.showEditClientModal = true;
    this.cdr.markForCheck();
  }

  createClient(): void {
    this.showAddClientModal = true;
  }

  approveClient(client: AgentClient): void {
    if (!client.userId) return;
    this.actionLoadingId = client.userId;
    this.api.approveClient(client.userId)
      .pipe(finalize(() => {
        this.actionLoadingId = null;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => this.loadClients(),
        error: (err) => {
          this.error = 'Failed to approve client';
          console.error('Approve client error:', err);
        }
      });
  }

  suspendClient(client: AgentClient): void {
    if (!client.userId) return;
    const reason = prompt('Reason for suspension (optional):');
    this.actionLoadingId = client.userId;
    this.api.suspendClient(client.userId, reason || undefined)
      .pipe(finalize(() => {
        this.actionLoadingId = null;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => this.loadClients(),
        error: (err) => {
          this.error = 'Failed to suspend client';
          console.error('Suspend client error:', err);
        }
      });
  }

  rejectClient(client: AgentClient): void {
    if (!client.userId) return;
    const reason = prompt('Reason for rejection (optional):');
    this.actionLoadingId = client.userId;
    this.api.rejectClient(client.userId, reason || undefined)
      .pipe(finalize(() => {
        this.actionLoadingId = null;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => this.loadClients(),
        error: (err) => {
          this.error = 'Failed to reject client';
          console.error('Reject client error:', err);
        }
      });
  }

  getVisibleClients(): AgentClient[] {
    return this.clients.filter(client => {
      if (this.selectedPriorities.length === 0) {
        return true;
      }
      return this.selectedPriorities.includes(this.getPriorityCategory(client.priorityScore));
    });
  }

  getPriorityCategory(score?: number): string {
    if (!score) {
      return 'LOW';
    }
    if (score >= 80) {
      return 'HIGH';
    }
    if (score >= 50) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'ACTIVE': return '✔️';
      case 'INACTIVE': return '⏸️';
      case 'SUSPENDED': return '⛔';
      case 'BLOCKED': return '🚫';
      default: return 'ℹ️';
    }
  }

  getStatusBadgeClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getPriorityClass(score?: number): string {
    if (!score) return 'priority-low';
    if (score >= 80) return 'priority-high';
    if (score >= 50) return 'priority-medium';
    return 'priority-low';
  }

  // Modal methods
  closeAddClientModal(): void {
    this.showAddClientModal = false;
    this.resetAddClientForm();
  }

  resetAddClientForm(): void {
    this.newClient = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: ''
    };
    this.addClientLoading = false;
  }

  submitAddClient(): void {
    if (!this.newClient.firstName || !this.newClient.lastName || !this.newClient.email || !this.newClient.phoneNumber) {
      this.error = 'First name, last name, email, and phone number are required.';
      return;
    }

    this.addClientLoading = true;
    this.error = null;

    this.api.createClient(this.newClient)
      .pipe(finalize(() => {
        this.addClientLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          this.closeAddClientModal();
          this.loadClients();
        },
        error: (err) => {
          console.error('Create client error:', err);
          if (err.error && err.error.message) {
            this.error = err.error.message;
          } else if (err.status === 400) {
            this.error = 'Invalid client data. Please check the form and try again.';
          } else if (err.status === 409) {
            this.error = 'A client with this email or phone number already exists.';
          } else if (err.status === 403) {
            this.error = 'You do not have permission to create clients.';
          } else {
            this.error = 'Failed to create client. Please try again later.';
          }
        }
      });
  }

  // Modal methods
  closeViewClientModal(): void {
    this.showViewClientModal = false;
    this.selectedClient = null;
    this.cdr.markForCheck();
  }

  closeEditClientModal(): void {
    this.showEditClientModal = false;
    this.selectedClient = null;
    this.cdr.markForCheck();
  }

  saveEditedClient(): void {
    if (!this.selectedClient || !this.selectedClient.userId) return;

    this.editClientLoading = true;
    this.cdr.markForCheck();

    // For now, we'll just close the modal and refresh
    // In a real implementation, you'd call an update API
    setTimeout(() => {
      this.editClientLoading = false;
      this.closeEditClientModal();
      this.loadClients(); // Refresh the list
    }, 1000);
  }
}