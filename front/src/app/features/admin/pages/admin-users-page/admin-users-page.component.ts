import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminApi } from '../../data-access/admin.api';
import { UserResponse, UserRole, UserStatus } from '../../models/admin.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf],
  templateUrl: './admin-users-page.component.html',
  styleUrl: './admin-users-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminUsersPageComponent implements OnInit {
  private readonly api = inject(AdminApi);
  private readonly cdr = inject(ChangeDetectorRef);

  users: UserResponse[] = [];
  selectedIds = new Set<number>();
  loading = false;
  error: string | null = null;
  query = '';
  roleFilter: UserRole | '' = '';
  statusFilter: UserStatus | '' = '';
  page = 0;
  size = 12;
  totalElements = 0;
  availableRoles: UserRole[] = ['ADMIN', 'AGENT', 'CLIENT'];
  availableStatus: UserStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BLOCKED'];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.api.findUsers(this.query || undefined, this.roleFilter || undefined, this.statusFilter || undefined, this.page, this.size)
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: data => {
          this.users = data.content ?? [];
          this.totalElements = data.totalElements ?? 0;
          this.selectedIds.clear();
          this.cdr.markForCheck();
        },
        error: () => {
          this.error = 'Impossible de charger la liste des utilisateurs. Réessayez.';
          this.cdr.markForCheck();
        }
      });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalElements / this.size));
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

  updateStatus(user: UserResponse): void {
    if (!user.userId) return;

    const action = user.status === 'ACTIVE' ? 'block' : 'activate';
    const handler = action === 'block' ? this.api.blockUser(user.userId) : this.api.activateUser(user.userId);

    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    handler.pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => this.loadUsers(),
        error: () => {
          this.error = `Impossible de ${action === 'block' ? 'bloquer' : 'débloquer'} cet utilisateur.`;
          this.cdr.markForCheck();
        }
      });
  }

  deleteUser(user: UserResponse): void {
    if (!user.userId) return;
    if (user.role === 'ADMIN') {
      this.error = 'La suppression des administrateurs est désactivée.';
      this.cdr.markForCheck();
      return;
    }

    if (!window.confirm(`Supprimer ${user.firstName} ${user.lastName} ?`)) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.api.deleteUser(user.userId)
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => this.loadUsers(),
        error: () => {
          this.error = 'Impossible de supprimer cet utilisateur.';
          this.cdr.markForCheck();
        }
      });
  }

  changeRole(user: UserResponse, role: UserRole): void {
    if (!user.userId || user.role === role) return;

    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.api.changeUserRole(user.userId, role)
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => this.loadUsers(),
        error: () => {
          this.error = 'Impossible de mettre à jour le rôle.';
          this.cdr.markForCheck();
        }
      });
  }

  bulkDelete(): void {
    if (this.selectedIds.size === 0) return;
    if (!window.confirm(`Supprimer ${this.selectedIds.size} utilisateurs sélectionnés ?`)) return;

    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.api.bulkDelete(Array.from(this.selectedIds))
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => this.loadUsers(),
        error: () => {
          this.error = 'Erreur lors de la suppression en masse.';
          this.cdr.markForCheck();
        }
      });
  }

  bulkUpdateStatus(status: UserStatus): void {
    if (this.selectedIds.size === 0) return;

    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.api.bulkUpdateStatus(Array.from(this.selectedIds), status)
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => this.loadUsers(),
        error: () => {
          this.error = 'Impossible de mettre à jour le statut en masse.';
          this.cdr.markForCheck();
        }
      });
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.page = page;
    this.loadUsers();
  }

  getStatusClass(status: UserStatus): string {
    return `status--${status?.toLowerCase()}`;
  }

  getRoleClass(role: UserRole): string {
    return `role--${role?.toLowerCase()}`;
  }
}
