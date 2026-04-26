import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, interval } from 'rxjs';
import { AnalyticsApi } from '../../data-access/analytics.api';
import { AgentPerformanceScore } from '../../models/analytics.model';

@Component({
  selector: 'app-agent-performance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agent-performance.component.html',
  styleUrls: ['./agent-performance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentPerformanceComponent implements OnInit, OnDestroy {
  agents: AgentPerformanceScore[] = [];
  selectedAgent: AgentPerformanceScore | null = null;
  loading = false;
  error: string | null = null;
  
  sortBy: 'score' | 'success' | 'volume' | 'speed' = 'score';
  limitAgents = 15;
  autoRefreshEnabled = true;
  
  Math = Math; // Expose Math for template
  
  private destroy$ = new Subject<void>();

  constructor(private analyticsApi: AnalyticsApi) {}

  ngOnInit(): void {
    this.loadAgents();
    
    if (this.autoRefreshEnabled) {
      interval(5 * 60 * 1000) // 5 minutes
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadAgents());
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAgents(): void {
    this.loading = true;
    this.error = null;
    
    this.analyticsApi.getAgentPerformanceRanking(this.limitAgents)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.agents = Array.isArray(response) ? response : response.data || [];
          this.loading = false;
          this.sortAgents();
        },
        error: (err) => {
          this.error = 'Failed to load agent performance data';
          this.loading = false;
          console.error(err);
        }
      });
  }

  selectAgent(agent: AgentPerformanceScore): void {
    this.selectedAgent = this.selectedAgent?.agentId === agent.agentId ? null : agent;
  }

  sortAgents(): void {
    this.agents.sort((a, b) => {
      switch (this.sortBy) {
        case 'score':
          return b.finalPerformanceScore - a.finalPerformanceScore;
        case 'success':
          return b.successRate - a.successRate;
        case 'volume':
          return b.volumeScore - a.volumeScore;
        case 'speed':
          return b.speedScore - a.speedScore;
        default:
          return 0;
      }
    });
  }

  setSortBy(by: 'score' | 'success' | 'volume' | 'speed'): void {
    this.sortBy = by;
    this.sortAgents();
  }

  toggleAutoRefresh(): void {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;
    if (this.autoRefreshEnabled) {
      interval(5 * 60 * 1000)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadAgents());
    }
  }

  getScoreColor(score: number): string {
    if (score >= 85) return 'bg-green-100 text-green-900';
    if (score >= 70) return 'bg-blue-100 text-blue-900';
    if (score >= 50) return 'bg-yellow-100 text-yellow-900';
    return 'bg-red-100 text-red-900';
  }

  getScoreBadgeColor(score: number): string {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getTeamComparison(agent: AgentPerformanceScore): string {
    const avgScore = this.agents.reduce((sum, a) => sum + a.finalPerformanceScore, 0) / this.agents.length;
    const diff = agent.finalPerformanceScore - avgScore;
    if (diff > 0) return `+${diff.toFixed(1)} above average`;
    if (diff < 0) return `${diff.toFixed(1)} below average`;
    return 'equals average';
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTrendArrow(trend: number): string {
    if (trend > 0) return '↑';
    if (trend < 0) return '↓';
    return '→';
  }

  getTrendColor(trend: number): string {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  }
}
