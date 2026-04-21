import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { finalize } from 'rxjs';
import { AdminApi } from '../../data-access/admin.api';
import { AgentPerformance, PageResponse, UserResponse } from '../../models/admin.model';

@Component({
  standalone: true,
  imports: [CommonModule, NgFor, NgIf],
  templateUrl: './admin-agents-page.component.html',
  styleUrl: './admin-agents-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminAgentsPageComponent implements OnInit {
  private readonly api = inject(AdminApi);
  private readonly cdr = inject(ChangeDetectorRef);

  agents: UserResponse[] = [];
  performance: AgentPerformance | null = null;
  selectedAgent: UserResponse | null = null;
  page = 0;
  size = 10;
  totalElements = 0;
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadAgents();
  }

  loadAgents(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.api.getAgents(this.page, this.size)
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (data: PageResponse<UserResponse>) => {
          this.agents = data.content ?? [];
          this.totalElements = data.totalElements ?? 0;
          if (this.agents.length > 0 && !this.selectedAgent) {
            this.selectAgent(this.agents[0]);
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.error = 'Impossible de charger la liste des agents.';
          this.cdr.markForCheck();
        }
      });
  }

  selectAgent(agent: UserResponse): void {
    this.selectedAgent = agent;
    this.performance = null;
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    if (!agent.userId) {
      this.error = 'Agent invalide.';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.api.getAgentPerformance(agent.userId)
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: stats => {
          this.performance = stats;
          this.cdr.markForCheck();
        },
        error: () => {
          this.error = 'Impossible de charger les statistiques de performance.';
          this.cdr.markForCheck();
        }
      });
  }

  goToPage(page: number): void {
    if (page < 0 || page >= Math.ceil(this.totalElements / this.size)) return;
    this.page = page;
    this.loadAgents();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalElements / this.size));
  }

  getApprovalRate(): number {
    if (!this.performance || this.performance.totalActions === 0) return 0;
    return (this.performance.approvalActionsCount / this.performance.totalActions) * 100;
  }
}
