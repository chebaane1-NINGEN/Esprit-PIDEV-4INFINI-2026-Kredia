import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AgentApi } from '../../data-access/agent.api';
import { AgentClient } from '../../models/agent.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-client-form-page.component.html',
  styleUrls: ['./agent-client-form-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentClientFormPageComponent {
  private readonly api = inject(AgentApi);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  client: Partial<AgentClient> = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    gender: ''
  };
  loading = false;
  error: string | null = null;

  saveClient(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.api.createClient(this.client)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (createdClient) => {
          this.router.navigate(['/agent/clients', createdClient.userId]);
        },
        error: (err) => {
          console.error('Create client error:', err);
          if (err.error && err.error.message) {
            this.error = err.error.message;
          } else if (err.error && err.error.fields) {
            // Handle validation errors
            const fieldErrors = Object.values(err.error.fields).join(', ');
            this.error = `Validation failed: ${fieldErrors}`;
          } else {
            this.error = 'Failed to create client. Please check your input and try again.';
          }
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/agent/clients']);
  }
}
