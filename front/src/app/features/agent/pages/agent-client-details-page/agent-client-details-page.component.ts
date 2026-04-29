import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AgentApi } from '../../data-access/agent.api';
import { ClientDetails, AgentClient } from '../../models/agent.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-client-details-page.component.html',
  styleUrl: './agent-client-details-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentClientDetailsPageComponent implements OnInit {
  private readonly api = inject(AgentApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  client: ClientDetails | null = null;
  editModel: Partial<AgentClient> = {};
  isEditMode = false;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    const clientId = this.route.snapshot.params['id'];
    if (clientId) {
      this.loadClientDetails(+clientId);
    }
  }

  loadClientDetails(clientId: number): void {
    this.loading = true;
    this.error = null;
    this.isEditMode = false;
    this.cdr.markForCheck();

    this.api.getClientDetails(clientId)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (data) => {
          this.client = data;
        },
        error: (err) => {
          this.error = 'Failed to load client details';
          console.error('Client details error:', err);
        }
      });
  }

  startEdit(): void {
    if (!this.client) {
      return;
    }
    this.isEditMode = true;
    this.editModel = {
      firstName: this.client.firstName,
      lastName: this.client.lastName,
      email: this.client.email,
      phoneNumber: this.client.phoneNumber,
      dateOfBirth: this.client.dateOfBirth,
      address: this.client.address,
      gender: this.client.gender
    };
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.editModel = {};
  }

  saveClient(): void {
    if (!this.client) {
      return;
    }
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.api.updateClient(this.client.userId, this.editModel)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (updatedClient) => {
          this.client = {
            ...this.client!,
            ...updatedClient
          };
          this.isEditMode = false;
        },
        error: (err) => {
          this.error = 'Failed to save client information';
          console.error('Update client error:', err);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/agent/clients']);
  }

  getActivityIcon(activityType: string): string {
    switch (activityType) {
      case 'LOGIN': return '🔑';
      case 'APPROVAL': return '✅';
      case 'CLIENT_HANDLED': return '👥';
      case 'STATUS_CHANGED': return '🔄';
      default: return '📝';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'ACTIVE': return '🟢';
      case 'INACTIVE': return '🟡';
      case 'SUSPENDED': return '🟠';
      case 'BLOCKED': return '🔴';
      default: return '⚪';
    }
  }

  approveClient(): void {
    if (!this.client?.userId) return;
    this.loading = true;
    this.cdr.markForCheck();

    this.api.approveClient(this.client.userId)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (updatedClient) => {
          this.client = { ...this.client!, ...updatedClient };
          // Reload to get updated activities
          this.loadClientDetails(this.client.userId);
        },
        error: (err) => {
          this.error = 'Failed to approve client';
          console.error('Approve client error:', err);
        }
      });
  }

  rejectClient(): void {
    if (!this.client?.userId) return;
    const reason = prompt('Reason for rejection (optional):');
    this.loading = true;
    this.cdr.markForCheck();

    this.api.rejectClient(this.client.userId, reason || undefined)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (updatedClient) => {
          this.client = { ...this.client!, ...updatedClient };
          // Reload to get updated activities
          this.loadClientDetails(this.client.userId);
        },
        error: (err) => {
          this.error = 'Failed to reject client';
          console.error('Reject client error:', err);
        }
      });
  }

  suspendClient(): void {
    if (!this.client?.userId) return;
    const reason = prompt('Reason for suspension (optional):');
    this.loading = true;
    this.cdr.markForCheck();

    this.api.suspendClient(this.client.userId, reason || undefined)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (updatedClient) => {
          this.client = { ...this.client!, ...updatedClient };
          // Reload to get updated activities
          this.loadClientDetails(this.client.userId);
        },
        error: (err) => {
          this.error = 'Failed to suspend client';
          console.error('Suspend client error:', err);
        }
      });
  }
}