import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, finalize } from 'rxjs';
import { AgentApi } from '../../data-access/agent.api';
import { AgentDashboard, AgentActivity } from '../../models/agent.model';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agent-dashboard-page.component.html',
  styleUrl: './agent-dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentDashboardPageComponent implements OnInit {
  private readonly api = inject(AgentApi);
  private readonly cdr = inject(ChangeDetectorRef);

  dashboard: AgentDashboard | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    forkJoin({
      metrics: this.api.getDashboard(),
      totalClients: this.api.getClients(undefined, undefined, 0, 1),
      activeClients: this.api.getClients(undefined, 'ACTIVE', 0, 1),
      activities: this.api.getActivity(0, 5)
    })
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: ({ metrics, totalClients, activeClients, activities }) => {
          this.dashboard = {
            ...metrics,
            totalClients: totalClients.totalElements,
            activeClients: activeClients.totalElements,
            recentActivities: activities.content || []
          };
        },
        error: (err) => {
          this.error = 'Failed to load dashboard data';
          console.error('Dashboard error:', err);
        }
      });
  }

  getActivityIcon(activity: AgentActivity): string {
    switch (activity.actionType) {
      case 'LOGIN': return '🔑';
      case 'APPROVAL': return '✅';
      case 'CLIENT_HANDLED': return '👥';
      case 'STATUS_CHANGED': return '🔄';
      default: return '📝';
    }
  }
}