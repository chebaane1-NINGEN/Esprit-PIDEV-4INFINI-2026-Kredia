import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, interval } from 'rxjs';
import { takeUntil, switchMap, finalize } from 'rxjs/operators';
import { AnalyticsApi } from '../../data-access/analytics.api';
import { EnhancedAnalyticsDashboard, KpiMetric, DrillDownData } from '../../models/analytics.model';

/**
 * Analytics Dashboard Component (Enhanced Version)
 * 
 * Affiche:
 * - 4 KPI Cards (Growth, Activity, System Load, Success Rate)
 * - Graphiques temporels 
 * - Stats cartes
 * - Santé du système
 * - Modals drill-down pour chaque KPI
 */
@Component({
  standalone: true,
  selector: 'app-analytics-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrl: './analytics-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  private readonly analyticsApi = inject(AnalyticsApi);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  // === Data ===
  dashboard: EnhancedAnalyticsDashboard | null = null;
  selectedDrillDown: DrillDownData | null = null;
  drillDownMetric: string | null = null;

  // === UI State ===
  loading = false;
  error: string | null = null;
  selectedPeriodDays: number = 30;
  autoRefreshEnabled = true;
  lastRefreshTime: Date | null = null;

  // === Drill-Down Modal ===
  showDrillDownModal = false;
  drillDownLoading = false;

  ngOnInit(): void {
    this.loadDashboard();
    
    // Auto-refresh toutes les 5 minutes
    interval(5 * 60 * 1000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.autoRefreshEnabled ? this.analyticsApi.getAnalyticsDashboard(this.selectedPeriodDays) : [])
      )
      .subscribe({
        next: (res) => {
          this.dashboard = res.data;
          this.lastRefreshTime = new Date();
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.analyticsApi.getAnalyticsDashboard(this.selectedPeriodDays)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.lastRefreshTime = new Date();
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (res) => {
          this.dashboard = res.data;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error = 'Impossible de charger le tableau de bord analytique.';
          console.error(err);
          this.cdr.markForCheck();
        }
      });
  }

  changePeriod(days: number): void {
    this.selectedPeriodDays = days;
    this.loadDashboard();
  }

  toggleAutoRefresh(): void {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;
  }

  manualRefresh(): void {
    this.loadDashboard();
  }

  // ==================== DRILL-DOWN ====================

  openDrillDown(metric: string): void {
    this.drillDownMetric = metric;
    this.drillDownLoading = true;
    this.showDrillDownModal = true;
    this.cdr.markForCheck();

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - this.selectedPeriodDays * 24 * 60 * 60 * 1000);
    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();

    switch (metric) {
      case 'growth-rate':
        this.analyticsApi.drillDownGrowthRate(startIso, endIso).subscribe({
          next: (res) => { this.selectedDrillDown = res.data; this.drillDownLoading = false; this.cdr.markForCheck(); },
          error: () => { this.drillDownLoading = false; this.cdr.markForCheck(); }
        });
        break;
      case 'activity-rate':
        this.analyticsApi.drillDownActivityRate(startIso, endIso).subscribe({
          next: (res) => { this.selectedDrillDown = res.data; this.drillDownLoading = false; this.cdr.markForCheck(); },
          error: () => { this.drillDownLoading = false; this.cdr.markForCheck(); }
        });
        break;
      case 'system-load':
        this.analyticsApi.drillDownSystemLoad().subscribe({
          next: (res) => { this.selectedDrillDown = res.data; this.drillDownLoading = false; this.cdr.markForCheck(); },
          error: () => { this.drillDownLoading = false; this.cdr.markForCheck(); }
        });
        break;
      case 'success-rate':
        this.analyticsApi.drillDownSuccessRate(startIso, endIso).subscribe({
          next: (res) => { this.selectedDrillDown = res.data; this.drillDownLoading = false; this.cdr.markForCheck(); },
          error: () => { this.drillDownLoading = false; this.cdr.markForCheck(); }
        });
        break;
    }
  }

  closeDrillDown(): void {
    this.showDrillDownModal = false;
    this.selectedDrillDown = null;
    this.drillDownMetric = null;
    this.cdr.markForCheck();
  }

  // ==================== HELPER METHODS ====================

  getKpiColor(kpi: KpiMetric): string {
    if (kpi.trendDirection === 'UP') return 'text-green-600';
    if (kpi.trendDirection === 'DOWN') return 'text-red-600';
    return 'text-gray-600';
  }

  getHealthStatusColor(status: string): string {
    switch (status) {
      case 'EXCELLENT': return 'bg-green-100 text-green-800';
      case 'GOOD': return 'bg-blue-100 text-blue-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatNumber(value: any): string {
    if (typeof value === 'number') {
      if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
      if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
      return value.toFixed(0);
    }
    return String(value);
  }

  getTrendArrow(direction?: string): string {
    if (direction === 'UP') return '↑';
    if (direction === 'DOWN') return '↓';
    return '→';
  }

  getTimeAgo(): string {
    if (!this.lastRefreshTime) return 'Jamais';
    const seconds = Math.floor((new Date().getTime() - this.lastRefreshTime.getTime()) / 1000);
    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    return `Il y a ${Math.floor(seconds / 3600)} h`;
  }
}

