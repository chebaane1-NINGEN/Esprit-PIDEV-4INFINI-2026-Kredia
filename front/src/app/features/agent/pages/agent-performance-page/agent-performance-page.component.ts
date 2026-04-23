import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { AgentApi } from '../../data-access/agent.api';
import { AgentPerformance } from '../../models/agent.model';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agent-performance-page.component.html',
  styleUrl: './agent-performance-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentPerformancePageComponent implements OnInit {
  private readonly api = inject(AgentApi);
  private readonly cdr = inject(ChangeDetectorRef);

  performance: AgentPerformance | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadPerformance();
  }

  loadPerformance(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.api.getPerformance()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (data) => {
          this.performance = data;
        },
        error: (err) => {
          this.error = 'Failed to load performance data';
          console.error('Performance error:', err);
        }
      });
  }

  getPerformanceBadge(): string {
    if (!this.performance) return 'Unknown';

    const score = this.performance.performanceScore;
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Average';
    return 'Needs Improvement';
  }

  getPerformanceColor(): string {
    if (!this.performance) return '#gray';

    const score = this.performance.performanceScore;
    if (score >= 90) return '#10B981'; // green
    if (score >= 75) return '#3B82F6'; // blue
    if (score >= 60) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  }

  getApprovalRate(): number {
    if (!this.performance) return 0;
    const total = this.performance.approvalActionsCount + this.performance.rejectionActionsCount;
    return total > 0 ? Math.round((this.performance.approvalActionsCount / total) * 100) : 0;
  }

  getMonthlyApprovalRate(approvals: number, rejections: number): number {
    const total = approvals + rejections;
    return total > 0 ? Math.round((approvals / total) * 100) : 0;
  }
}