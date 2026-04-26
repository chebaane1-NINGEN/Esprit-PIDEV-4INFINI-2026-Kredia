import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminApi } from '../../data-access/admin.api';
import { UserResponse, UserRole, UserStatus } from '../../models/admin.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users-page.component.html',
  styleUrl: './admin-users-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminUsersPageComponent implements OnInit {
  private readonly api = inject(AdminApi);
  private readonly cdr = inject(ChangeDetectorRef);

  // ===== UI STATE =====
  loading = false;
  createLoading = false;
  editLoading = false;
  deleteLoading = false;
  exportLoading = false;
  error: string | null = null;

  // ===== DATA STATE =====
  users: UserResponse[] = [];
  agents: UserResponse[] = [];
  totalElements = 0;
  page = 0;
  size = 12;
  selectedIds = new Set<number>();

  // ===== SORTING =====
  sortKey: keyof UserResponse = 'firstName';
  sortDirection: 'asc' | 'desc' = 'asc';

  // ===== FILTERS =====
  filterQuery = '';
  filterRoles: string[] = [];
  filterStatus: string[] = [];
  filterCreatedFrom = '';
  filterCreatedTo = '';
  filteredResultsCount: number | null = null;
  private filterTimeout: any;

  // ===== AVAILABLE OPTIONS =====
  availableRoles: UserRole[] = ['ADMIN', 'AGENT', 'CLIENT'];
  availableStatus: UserStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BLOCKED'];

  // ===== MODAL STATES =====
  showAddUserModal = false;
  showViewUserModal = false;
  showEditUserModal = false;
  showDeleteConfirm = false;
  showAdvancedFiltersModal = false;

  // ===== MODAL DATA =====
  viewingUser: UserResponse | null = null;
  editingUser: UserResponse | null = null;
  userToDelete: UserResponse | null = null;

  // ===== FORM DATA =====
  newUser: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    status: UserStatus;
  } = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'CLIENT',
    status: 'ACTIVE'
  };

  showPassword = false;
  exportDropdownOpen = false;

  ngOnInit(): void {
    this.loadUsers();
    this.loadAgents();
  }

  // ==================== CRUD OPERATIONS ====================

  /**
   * Load users with current filters and pagination
   */
  loadUsers(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    const roles = this.filterRoles.length > 0 ? (this.filterRoles as UserRole[]) : undefined;
    const statuses = this.filterStatus.length > 0 ? (this.filterStatus as UserStatus[]) : undefined;

    this.api.findUsers(
      this.filterQuery || undefined,
      roles,
      statuses,
      this.filterCreatedFrom || undefined,
      this.filterCreatedTo || undefined,
      this.page,
      this.size
    )
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (data) => {
          this.users = data.content ?? [];
          this.totalElements = data.totalElements ?? 0;
          this.selectedIds.clear();
          this.applySorting();
          this.showToast('Users loaded successfully', 'info');
        },
        error: () => {
          this.error = 'Failed to load users. Please try again.';
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Refresh users with UI feedback
   */
  refreshUsers(): void {
    this.showToast('Refreshing user list...', 'info');
    this.loadUsers();
  }

  /**
   * Load available agents
   */
  loadAgents(): void {
    this.api.getAgents(0, 100).subscribe({
      next: (data) => {
        this.agents = data.content ?? [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.agents = [];
      }
    });
  }

  /**
   * Create new user
   */
  createUser(): void {
    this.createLoading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.api.createUser({
      firstName: this.newUser.firstName,
      lastName: this.newUser.lastName,
      email: this.newUser.email,
      phone: this.newUser.phone,
      password: this.newUser.password,
      role: this.newUser.role,
      status: this.newUser.status
    } as UserResponse)
      .pipe(finalize(() => { this.createLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.showToast(`User ${this.newUser.firstName} created successfully!`, 'success');
          this.closeAddUserModal();
          this.resetAddUserForm();
          this.page = 0;
          this.loadUsers();
        },
        error: (err) => {
          const msg = err.error?.message || 'Failed to create user. Please check the information.';
          this.error = msg;
          this.showToast(msg, 'error');
        }
      });
  }

  /**
   * Update user details
   */
  updateUser(): void {
    if (!this.editingUser?.userId) return;

    this.editLoading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.api.updateUser(this.editingUser.userId, {
      firstName: this.editingUser.firstName,
      lastName: this.editingUser.lastName,
      email: this.editingUser.email,
      phone: this.editingUser.phone,
      role: this.editingUser.role,
      status: this.editingUser.status
    } as UserResponse)
      .pipe(finalize(() => { this.editLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.showToast('User updated successfully!', 'success');
          this.closeEditUserModal();
          this.loadUsers();
        },
        error: (err) => {
          const msg = err.error?.message || 'Failed to update user.';
          this.error = msg;
          this.showToast(msg, 'error');
        }
      });
  }

  /**
   * Delete user (with confirmation)
   */
  deleteUser(user: UserResponse): void {
    if (!user.userId) return;
    if (user.role === 'ADMIN') {
      this.error = 'Administrators cannot be deleted';
      this.cdr.markForCheck();
      return;
    }
    this.userToDelete = user;
    this.showDeleteConfirm = true;
    this.cdr.markForCheck();
  }

  /**
   * Confirm user deletion
   */
  confirmDelete(): void {
    if (!this.userToDelete?.userId) return;

    this.deleteLoading = true;
    this.cdr.markForCheck();

    this.api.deleteUser(this.userToDelete.userId)
      .pipe(finalize(() => { this.deleteLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.showToast('User deleted successfully', 'success');
          this.cancelDelete();
          this.loadUsers();
        },
        error: () => {
          this.error = 'Failed to delete user.';
          this.showToast('Failed to delete user', 'error');
        }
      });
  }

  /**
   * Cancel deletion
   */
  cancelDelete(): void {
    this.userToDelete = null;
    this.showDeleteConfirm = false;
    this.cdr.markForCheck();
  }

  /**
   * Update user status (toggle active/blocked)
   */
  updateStatus(user: UserResponse): void {
    if (!user.userId) return;

    this.loading = true;
    this.cdr.markForCheck();

    const newStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    const request = newStatus === 'BLOCKED' 
      ? this.api.blockUser(user.userId) 
      : this.api.activateUser(user.userId);

    request.pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.showToast(`User ${newStatus === 'BLOCKED' ? 'blocked' : 'activated'} successfully`, 'success');
          this.loadUsers();
        },
        error: () => {
          this.error = 'Failed to update user status.';
          this.showToast('Failed to update status', 'error');
        }
      });
  }

  /**
   * Change user role
   */
  changeRole(user: UserResponse, role: UserRole): void {
    if (!user.userId || user.role === role) return;

    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.api.changeUserRole(user.userId, role)
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.showToast('User role updated', 'success');
          this.loadUsers();
        },
        error: () => {
          this.error = 'Failed to update role.';
          this.showToast('Failed to update role', 'error');
        }
      });
  }

  /**
   * Assign client to agent
   */
  assignAgent(user: UserResponse, agentIdStr: string): void {
    if (!user.userId) return;
    const agentId = parseInt(agentIdStr, 10);

    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    const request = isNaN(agentId)
      ? this.api.unassignClient(user.userId)
      : this.api.assignClient(agentId, user.userId);

    request.pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.showToast('Assignment updated', 'success');
          this.loadUsers();
        },
        error: () => {
          this.error = 'Failed to assign agent.';
          this.showToast('Failed to assign agent', 'error');
        }
      });
  }

  // ==================== BULK OPERATIONS ====================

  bulkDelete(): void {
    if (this.selectedIds.size === 0) return;
    if (!confirm(`Delete ${this.selectedIds.size} user(s)? This cannot be undone.`)) return;

    this.loading = true;
    this.cdr.markForCheck();

    this.api.bulkDelete(Array.from(this.selectedIds))
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.showToast('Users deleted successfully', 'success');
          this.selectedIds.clear();
          this.loadUsers();
        },
        error: () => {
          this.error = 'Failed to delete selected users.';
          this.showToast('Bulk delete failed', 'error');
        }
      });
  }

  bulkUpdateStatus(status: UserStatus): void {
    if (this.selectedIds.size === 0) return;

    this.loading = true;
    this.cdr.markForCheck();

    this.api.bulkUpdateStatus(Array.from(this.selectedIds), status)
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.showToast(`Users status updated to ${status}`, 'success');
          this.selectedIds.clear();
          this.loadUsers();
        },
        error: () => {
          this.error = 'Failed to update user statuses.';
          this.showToast('Bulk status update failed', 'error');
        }
      });
  }

  // ==================== EXPORT OPERATIONS ====================

  exportCsv(): void {
    this.exportLoading = true;
    this.cdr.markForCheck();

    const ids = Array.from(this.selectedIds);
    const roles = this.filterRoles.length > 0 ? (this.filterRoles as UserRole[]) : undefined;
    const statuses = this.filterStatus.length > 0 ? (this.filterStatus as UserStatus[]) : undefined;

    const request = ids.length > 0
      ? this.api.exportSelectedCsv(ids)
      : this.api.exportUsersCsv(
          this.filterQuery || undefined,
          roles,
          statuses,
          this.filterCreatedFrom || undefined,
          this.filterCreatedTo || undefined
        );

    request.pipe(finalize(() => { this.exportLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (blob: Blob) => {
          const timestamp = new Date().toISOString().split('T')[0];
          const filename = ids.length > 0 ? `selected-users-${timestamp}.csv` : `users-export-${timestamp}.csv`;
          this.downloadFile(blob, filename, 'text/csv');
          this.showToast('CSV exported successfully', 'success');
          this.exportDropdownOpen = false;
        },
        error: () => {
          this.showToast('Failed to export CSV', 'error');
        }
      });
  }

  exportExcel(): void {
    this.exportLoading = true;
    this.cdr.markForCheck();

    const ids = Array.from(this.selectedIds);
    const roles = this.filterRoles.length > 0 ? (this.filterRoles as UserRole[]) : undefined;
    const statuses = this.filterStatus.length > 0 ? (this.filterStatus as UserStatus[]) : undefined;

    const request = ids.length > 0
      ? this.api.exportSelectedExcel(ids)
      : this.api.exportUsersExcel(
          this.filterQuery || undefined,
          roles,
          statuses,
          this.filterCreatedFrom || undefined,
          this.filterCreatedTo || undefined
        );

    request.pipe(finalize(() => { this.exportLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (blob: Blob) => {
          const timestamp = new Date().toISOString().split('T')[0];
          const filename = ids.length > 0 ? `selected-users-${timestamp}.xlsx` : `users-export-${timestamp}.xlsx`;
          this.downloadFile(blob, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          this.showToast('Excel exported successfully', 'success');
          this.exportDropdownOpen = false;
        },
        error: () => {
          this.showToast('Failed to export Excel', 'error');
        }
      });
  }

  private downloadFile(blob: Blob, filename: string, mimeType: string): void {
    const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // ==================== FILTERS ====================

  openAdvancedFiltersModal(): void {
    this.showAdvancedFiltersModal = true;
    this.cdr.markForCheck();
  }

  closeAdvancedFiltersModal(): void {
    this.showAdvancedFiltersModal = false;
    this.cdr.markForCheck();
  }

  resetAdvancedFilters(): void {
    this.filterQuery = '';
    this.filterRoles = [];
    this.filterStatus = [];
    this.filterCreatedFrom = '';
    this.filterCreatedTo = '';
    this.filteredResultsCount = null;
    this.cdr.markForCheck();
  }

  onFilterChange(): void {
    clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(() => {
      this.updateFilteredResultsCount();
    }, 300);
  }

  updateFilteredResultsCount(): void {
    const roles = this.filterRoles.length > 0 ? (this.filterRoles as UserRole[]) : undefined;
    const statuses = this.filterStatus.length > 0 ? (this.filterStatus as UserStatus[]) : undefined;

    this.api.findUsers(
      this.filterQuery || undefined,
      roles,
      statuses,
      this.filterCreatedFrom || undefined,
      this.filterCreatedTo || undefined,
      0,
      1
    ).subscribe({
      next: (data) => {
        this.filteredResultsCount = data.totalElements ?? 0;
        this.cdr.markForCheck();
      },
      error: () => {
        this.filteredResultsCount = null;
      }
    });
  }

  applyAdvancedFilters(): void {
    this.page = 0;
    this.loadUsers();
    this.closeAdvancedFiltersModal();
  }

  hasActiveFilters(): boolean {
    return this.filterRoles.length > 0 ||
           this.filterStatus.length > 0 ||
           !!this.filterCreatedFrom ||
           !!this.filterCreatedTo ||
           !!this.filterQuery;
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.filterRoles.length > 0) count++;
    if (this.filterStatus.length > 0) count++;
    if (this.filterCreatedFrom || this.filterCreatedTo) count++;
    if (this.filterQuery) count++;
    return count;
  }

  // ==================== MODALS ====================

  openAddUserModal(): void {
    this.showAddUserModal = true;
    this.error = null;
    this.resetAddUserForm();
    this.cdr.markForCheck();
  }

  closeAddUserModal(): void {
    this.showAddUserModal = false;
    this.error = null;
    this.resetAddUserForm();
    this.cdr.markForCheck();
  }

  openViewUserModal(user: UserResponse): void {
    this.viewingUser = user;
    this.showViewUserModal = true;
    this.cdr.markForCheck();
  }

  closeViewUserModal(): void {
    this.viewingUser = null;
    this.showViewUserModal = false;
    this.cdr.markForCheck();
  }

  openEditUserModal(user: UserResponse): void {
    this.editingUser = { ...user };
    this.showEditUserModal = true;
    this.error = null;
    this.cdr.markForCheck();
  }

  closeEditUserModal(): void {
    this.editingUser = null;
    this.showEditUserModal = false;
    this.error = null;
    this.cdr.markForCheck();
  }

  // ==================== DROPDOWN & UI ====================

  toggleExportDropdown(): void {
    this.exportDropdownOpen = !this.exportDropdownOpen;
    this.cdr.markForCheck();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    this.cdr.markForCheck();
  }

  // ==================== TABLE OPERATIONS ====================

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalElements / this.size));
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.page = page;
    this.loadUsers();
  }

  sortBy(key: keyof UserResponse): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  private applySorting(): void {
    const direction = this.sortDirection === 'asc' ? 1 : -1;

    this.users = [...this.users].sort((a, b) => {
      let valueA = a[this.sortKey] ?? '';
      let valueB = b[this.sortKey] ?? '';

      if (this.sortKey === 'createdAt') {
        return (new Date(valueA as string).getTime() - new Date(valueB as string).getTime()) * direction;
      }

      const aStr = String(valueA).toLowerCase();
      const bStr = String(valueB).toLowerCase();
      return aStr.localeCompare(bStr) * direction;
    });

    this.cdr.markForCheck();
  }

  toggleSelect(userId?: number): void {
    if (!userId) return;
    if (this.selectedIds.has(userId)) {
      this.selectedIds.delete(userId);
    } else {
      this.selectedIds.add(userId);
    }
    this.cdr.markForCheck();
  }

  isSelected(userId?: number): boolean {
    return !!userId && this.selectedIds.has(userId);
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.users.forEach(user => {
        if (user.userId) {
          this.selectedIds.add(user.userId);
        }
      });
    } else {
      this.selectedIds.clear();
    }
    this.cdr.markForCheck();
  }

  get isAllSelected(): boolean {
    return this.users.length > 0 && this.selectedIds.size === this.users.length;
  }

  get selectedCount(): number {
    return this.selectedIds.size;
  }

  // ==================== HELPERS ====================

  getStatusClass(status: UserStatus): string {
    return `status--${status?.toLowerCase()}`;
  }

  getRoleClass(role: UserRole): string {
    return `role--${role?.toLowerCase()}`;
  }

  private resetAddUserForm(): void {
    this.newUser = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      role: 'CLIENT',
      status: 'ACTIVE'
    };
  }

  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 4px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  // ==================== COMPUTED PROPERTIES ====================

  get totalUsers(): number {
    return this.totalElements;
  }

  get activeUsersCount(): number {
    return this.users.filter(u => u.status === 'ACTIVE').length;
  }

  get blockedUsersCount(): number {
    return this.users.filter(u => u.status === 'BLOCKED').length;
  }

  get newUsers24h(): number {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return this.users.filter(u => u.createdAt ? new Date(u.createdAt).getTime() >= cutoff : false).length;
  }

  get healthIndex(): number {
    return this.activeUsersCount > 0 && this.totalUsers > 0 
      ? Math.round((this.activeUsersCount / this.totalUsers) * 100)
      : 0;
  }

  get healthLabel(): string {
    const health = this.healthIndex;
    if (health >= 80) return 'Excellent';
    if (health >= 60) return 'Good';
    if (health >= 40) return 'Fair';
    return 'Poor';
  }
}
