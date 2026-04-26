import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { AdminApi } from '../../data-access/admin.api';
import { AdminStats, SystemDashboardStats } from '../../models/admin.model';

interface KpiCard {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  description?: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

@Component({
  standalone: true,
  imports: [CommonModule, NgFor, NgIf],
  templateUrl: './admin-analytics-page.component.html',
  styleUrl: './admin-analytics-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminAnalyticsPageComponent implements OnInit {
  readonly Math = Math;
  private readonly api = inject(AdminApi);
  private readonly cdr = inject(ChangeDetectorRef);

  stats: AdminStats | null = null;
  systemStats: SystemDashboardStats | null = null;
  loading = false;
  error: string | null = null;
  selectedRange: 'last7' | 'last30' | 'last90' = 'last30';

  // Enhanced KPIs
  kpiCards: KpiCard[] = [];
  userGrowthChart: ChartData | null = null;
  roleDistributionChart: ChartData | null = null;
  approvalChart: ChartData | null = null;

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.api.getAdminStats().subscribe({
      next: stats => {
        this.stats = stats;
        this.api.getSystemDashboardStats().subscribe({
          next: systemStats => {
            this.systemStats = systemStats;
            this.processAnalyticsData();
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.systemStats = null;
            this.processAnalyticsData();
            this.loading = false;
            this.error = 'Impossible de charger certaines statistiques système.';
            this.cdr.markForCheck();
          }
        });
      },
      error: () => {
        this.error = 'Impossible de charger les statistiques administratives. Réessayez ultérieurement.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private processAnalyticsData(): void {
    if (!this.stats) return;

    // Calculate KPIs
    this.calculateKPIs();

    // Generate charts
    this.generateCharts();
  }

  private calculateKPIs(): void {
    if (!this.stats) return;

    const totalUsers = this.stats.totalUser || 0;
    const activeUsers = this.stats.activeUser || 0;
    const newUsers24h = this.stats.last24hRegistrations || 0;
    const approvalCount = this.stats.approvalCount ?? 0;
    const rejectionCount = this.stats.rejectionCount ?? 0;

    const growthRate = this.calculateGrowthRate();
    const approvalRate = approvalCount + rejectionCount > 0
      ? (approvalCount / (approvalCount + rejectionCount)) * 100
      : 0;
    const systemHealth = this.stats.systemHealthIndex ?? 0;

    this.kpiCards = [
      {
        title: 'Total Users',
        value: totalUsers.toLocaleString(),
        icon: '👥',
        description: 'All registered users'
      },
      {
        title: 'Active Users',
        value: activeUsers.toLocaleString(),
        icon: '✅',
        description: 'Users active in last 30 days'
      },
      {
        title: 'New Users (24h)',
        value: newUsers24h.toLocaleString(),
        icon: '🆕',
        description: 'Registrations during the last 24 hours'
      },
      {
        title: 'Growth Rate',
        value: `${growthRate.toFixed(1)}%`,
        icon: '📈',
        description: 'Change in registration volume'
      },
      {
        title: 'Approval Rate',
        value: `${approvalRate.toFixed(1)}%`,
        icon: '👍',
        description: 'Application approval performance'
      },
      {
        title: 'System Health',
        value: `${systemHealth.toFixed(1)}%`,
        icon: '⚡',
        description: 'Backend health and user activity'
      }
    ];
  }

  private generateCharts(): void {
    // User Growth Chart
    const growthData = this.getRegistrationEvolutionData();
    if (growthData.length > 0) {
      this.userGrowthChart = {
        labels: growthData.map(d => d.label),
        datasets: [{
          label: 'New Users',
          data: growthData.map(d => d.value),
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          borderColor: '#7c3aed',
          fill: true
        }]
      };
    } else {
      this.userGrowthChart = null;
    }

    // Role Distribution Chart
    const roleDistribution = this.stats?.roleDistribution ?? {};
    const labels = Object.keys(roleDistribution);
    const values = labels.map(label => roleDistribution[label] ?? 0);
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
    this.roleDistributionChart = {
      labels,
      datasets: [{
        label: 'Users by Role',
        data: values,
        backgroundColor: colors.slice(0, values.length)
      }]
    };

    // Approval vs Rejection Chart
    const approvalCount = this.stats?.approvalCount ?? 0;
    const rejectionCount = this.stats?.rejectionCount ?? 0;
    this.approvalChart = {
      labels: ['Approved', 'Rejected'],
      datasets: [{
        label: 'Applications',
        data: [approvalCount, rejectionCount],
        backgroundColor: [
          '#10b981',
          '#ef4444'
        ]
      }]
    };
  }

  private getRegistrationEvolutionData(): { label: string; value: number }[] {
    if (!this.stats?.registrationEvolution) {
      return [];
    }
    return Object.entries(this.stats.registrationEvolution).map(([key, value]) => ({
      label: key,
      value
    }));
  }

  private calculateGrowthRate(): number {
    if (!this.stats?.registrationEvolution) {
      return 0;
    }
    const values = Object.values(this.stats.registrationEvolution);
    if (values.length < 2) {
      return 0;
    }
    const lastValue = values[values.length - 1];
    const previousValue = values[values.length - 2];
    return previousValue > 0 ? ((lastValue - previousValue) / previousValue) * 100 : 0;
  }

  onRangeChange(range: 'last7' | 'last30' | 'last90'): void {
    this.selectedRange = range;
    this.processAnalyticsData();
    this.cdr.markForCheck();
  }

  // Chart helper methods
  getLinePoints(data: number[]): string {
    const maxValue = Math.max(...data);
    const points: string[] = [];

    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (value / maxValue) * 100;
      points.push(`${x},${y}`);
    });

    return points.join(' ');
  }

  getPieSegments(chart: ChartData): any[] {
    const data = chart.datasets[0].data;
    const colors = chart.datasets[0].backgroundColor as string[];
    const total = data.reduce((sum, value) => sum + value, 0);
    const segments: any[] = [];
    let currentAngle = 0;

    data.forEach((value, index) => {
      const angle = (value / total) * 360;
      segments.push({
        color: colors[index],
        dasharray: `${angle} ${360 - angle}`,
        offset: currentAngle
      });
      currentAngle += angle;
    });

    return segments;
  }

  getPieLegend(chart: ChartData): any[] {
    const data = chart.datasets[0].data;
    const colors = chart.datasets[0].backgroundColor as string[];
    const labels = chart.labels;

    return labels.map((label, index) => ({
      label,
      value: data[index],
      color: colors[index]
    }));
  }

  getBarData(chart: ChartData): any[] {
    const data = chart.datasets[0].data;
    const colors = chart.datasets[0].backgroundColor as string[];
    const labels = chart.labels;
    const maxValue = Math.max(...data);

    return labels.map((label, index) => ({
      label,
      value: data[index],
      percentage: (data[index] / maxValue) * 100,
      color: colors[index]
    }));
  }

  getActivityBars(chart: ChartData): any[] {
    const loginsData = chart.datasets[0].data;
    const actionsData = chart.datasets[1].data;
    const labels = chart.labels;
    const maxLogins = Math.max(...loginsData);
    const maxActions = Math.max(...actionsData);

    return labels.map((label, index) => ({
      label,
      logins: loginsData[index],
      actions: actionsData[index],
      loginsPercent: (loginsData[index] / maxLogins) * 100,
      actionsPercent: (actionsData[index] / maxActions) * 100
    }));
  }

  getTransactionSuccessRate(): number {
    if (!this.systemStats?.totalTransactions || this.systemStats.totalTransactions === 0) {
      return 0;
    }
    const total = this.systemStats.totalTransactions;
    const fraudulent = this.systemStats.totalFraudulentTransactions ?? 0;
    return ((total - fraudulent) / total) * 100;
  }

  getFraudDetectionRate(): number {
    const fraudulent = this.systemStats?.totalFraudulentTransactions ?? 0;
    const total = this.systemStats?.totalTransactions ?? 0;
    if (total === 0) {
      return 0;
    }
    return Math.min((fraudulent / total) * 100, 100);
  }
}
