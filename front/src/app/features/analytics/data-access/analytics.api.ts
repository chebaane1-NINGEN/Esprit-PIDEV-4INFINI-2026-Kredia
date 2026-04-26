import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/http/api.config';
import {
  EnhancedAnalyticsDashboard,
  KpiMetric,
  TimeSeriesData,
  DrillDownData,
  AgentPerformanceScore,
  SystemHealth,
  PeriodComparison
} from '../models/analytics.model';

/**
 * Analytocs API Service pour le KPI Engine
 * Endpoints:
 * - GET /api/analytics/dashboard - Dashboard complet
 * - GET /api/analytics/kpi/* - KPIs individuels
 * - GET /api/analytics/timeseries/* - Données temporelles
 * - GET /api/analytics/drilldown/* - Données brutes
 * - GET /api/analytics/agents/* - Performance agents
 * - GET /api/analytics/system/* - Santé système
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = API_BASE_URL + '/analytics';

  // ==================== DASHBOARD ====================

  /**
   * Récupère le tableau de bord analytique complet
   */
  getAnalyticsDashboard(days: number = 30): Observable<{ data: EnhancedAnalyticsDashboard }> {
    return this.http.get<{ data: EnhancedAnalyticsDashboard }>(
      `${this.apiUrl}/dashboard`,
      { params: new HttpParams().set('days', days.toString()) }
    );
  }

  // ==================== KPIs ====================

  /**
   * Growth Rate KPI
   */
  getGrowthRateKpi(startDate: string, endDate: string): Observable<{ data: KpiMetric }> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<{ data: KpiMetric }>(`${this.apiUrl}/kpi/growth-rate`, { params });
  }

  /**
   * Activity Rate KPI
   */
  getActivityRateKpi(startDate: string, endDate: string): Observable<{ data: KpiMetric }> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<{ data: KpiMetric }>(`${this.apiUrl}/kpi/activity-rate`, { params });
  }

  /**
   * System Load KPI
   */
  getSystemLoadKpi(): Observable<{ data: KpiMetric }> {
    return this.http.get<{ data: KpiMetric }>(`${this.apiUrl}/kpi/system-load`);
  }

  /**
   * Success Rate KPI
   */
  getSuccessRateKpi(startDate: string, endDate: string): Observable<{ data: KpiMetric }> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<{ data: KpiMetric }>(`${this.apiUrl}/kpi/success-rate`, { params });
  }

  // ==================== TIME SERIES ====================

  /**
   * User Growth Time Series
   */
  getUserGrowthTimeSeries(
    granularity: string,
    startDate: string,
    endDate: string
  ): Observable<{ data: TimeSeriesData }> {
    const params = new HttpParams()
      .set('granularity', granularity)
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<{ data: TimeSeriesData }>(
      `${this.apiUrl}/timeseries/user-growth`,
      { params }
    );
  }

  /**
   * Activity Time Series
   */
  getActivityTimeSeries(
    granularity: string,
    startDate: string,
    endDate: string
  ): Observable<{ data: TimeSeriesData }> {
    const params = new HttpParams()
      .set('granularity', granularity)
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<{ data: TimeSeriesData }>(
      `${this.apiUrl}/timeseries/activity`,
      { params }
    );
  }

  /**
   * Success Rate Time Series
   */
  getSuccessRateTimeSeries(
    granularity: string,
    startDate: string,
    endDate: string
  ): Observable<{ data: TimeSeriesData }> {
    const params = new HttpParams()
      .set('granularity', granularity)
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<{ data: TimeSeriesData }>(
      `${this.apiUrl}/timeseries/success-rate`,
      { params }
    );
  }

  // ==================== DRILL-DOWN ====================

  /**
   * Drill-down Growth Rate: Données brutes et enregistrements
   */
  drillDownGrowthRate(startDate: string, endDate: string): Observable<{ data: DrillDownData }> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<{ data: DrillDownData }>(`${this.apiUrl}/drilldown/growth-rate`, { params });
  }

  /**
   * Drill-down Activity Rate
   */
  drillDownActivityRate(startDate: string, endDate: string): Observable<{ data: DrillDownData }> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<{ data: DrillDownData }>(`${this.apiUrl}/drilldown/activity-rate`, { params });
  }

  /**
   * Drill-down System Load
   */
  drillDownSystemLoad(): Observable<{ data: DrillDownData }> {
    return this.http.get<{ data: DrillDownData }>(`${this.apiUrl}/drilldown/system-load`);
  }

  /**
   * Drill-down Success Rate
   */
  drillDownSuccessRate(startDate: string, endDate: string): Observable<{ data: DrillDownData }> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<{ data: DrillDownData }>(`${this.apiUrl}/drilldown/success-rate`, { params });
  }

  // ==================== AGENT PERFORMANCE ====================

  /**
   * Classement des agents par performance
   */
  getAgentPerformanceRanking(limit: number = 10): Observable<{ data: AgentPerformanceScore[] }> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<{ data: AgentPerformanceScore[] }>(
      `${this.apiUrl}/agents/ranking`,
      { params }
    );
  }

  /**
   * Score de performance d'un agent spécifique
   */
  getAgentPerformanceScore(agentId: number, days: number = 30): Observable<{ data: AgentPerformanceScore }> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<{ data: AgentPerformanceScore }>(
      `${this.apiUrl}/agents/${agentId}/performance`,
      { params }
    );
  }

  /**
   * Vue 360° d'un agent (profil complet avec comparaisons)
   */
  getAgent360View(agentId: number): Observable<{ data: AgentPerformanceScore }> {
    return this.http.get<{ data: AgentPerformanceScore }>(
      `${this.apiUrl}/agents/${agentId}/360`
    );
  }

  /**
   * Drill-down performance d'un agent: données brutes détaillées
   */
  drillDownAgentPerformance(agentId: number): Observable<{ data: DrillDownData }> {
    return this.http.get<{ data: DrillDownData }>(
      `${this.apiUrl}/agents/${agentId}/drilldown`
    );
  }

  // ==================== SYSTÈME ====================

  /**
   * Santé du système: score global et détails par composant
   */
  getSystemHealth(): Observable<{ data: SystemHealth }> {
    return this.http.get<{ data: SystemHealth }>(`${this.apiUrl}/system/health`);
  }

  /**
   * Compare les métriques entre deux périodes
   */
  comparePeriods(days1: number, days2?: number): Observable<{ data: PeriodComparison }> {
    let params = new HttpParams().set('days1', days1.toString());
    if (days2) {
      params = params.set('days2', days2.toString());
    }
    return this.http.get<{ data: PeriodComparison }>(`${this.apiUrl}/system/compare-periods`, { params });
  }
}
