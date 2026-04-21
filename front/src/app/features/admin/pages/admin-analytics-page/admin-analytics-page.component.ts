import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { AdminApi } from '../../data-access/admin.api';
import { AdminStats, SystemDashboardStats } from '../../models/admin.model';

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
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.systemStats = null;
            this.loading = false;
            this.error = 'Impossible de charger certaines statistiques système.';
            this.cdr.markForCheck();
          }
        });
      },
      error: () => {
        this.loading = false;
        this.error = 'Impossible de charger les statistiques administratives.';
        this.cdr.markForCheck();
      }
    });
  }

  get registrationEvolution(): { label: string; value: number }[] {
    const entries = Object.entries(this.stats?.registrationEvolution ?? {});
    return entries.map(([label, value]) => ({ label, value }));
  }

  totalRoles(): number {
    return Object.values(this.stats?.roleDistribution ?? {}).reduce((sum, value) => sum + (value ?? 0), 0) || 1;
  }

  get roleDistribution(): { role: string; count: number; ratio: number }[] {
    return Object.entries(this.stats?.roleDistribution ?? {}).map(([role, count]) => ({
      role,
      count,
      ratio: (count / this.totalRoles()) * 100
    }));
  }

  getFilteredEvolution(): { label: string; value: number }[] {
    const values = this.registrationEvolution;
    if (values.length === 0) return [];

    const count = this.selectedRange === 'last7' ? 7 : this.selectedRange === 'last30' ? 30 : 90;
    return values.slice(-count);
  }
}
