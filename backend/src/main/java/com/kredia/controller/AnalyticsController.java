package com.kredia.controller;

import com.kredia.dto.ApiResponse;
import com.kredia.dto.analytics.*;
import com.kredia.service.analytics.AnalyticsService;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * AnalyticsController: Tous les endpoints pour le KPI Engine
 * 
 * Routes:
 * GET /api/analytics/dashboard - Dashboard complet avec tous les KPIs
 * GET /api/analytics/kpi/{kpiName} - Un KPI spécifique avec drill-down
 * GET /api/analytics/timeseries/{metric} - Données temporelles pour graphiques
 * GET /api/analytics/drilldown/{metric} - Données brutes derrière un KPI
 * GET /api/analytics/agents/ranking - Classement de performance des agents
 * GET /api/analytics/agents/{agentId}/360 - Vue 360° d'un agent
 * GET /api/analytics/system/health - Santé du système
 */
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    // ==================== DASHBOARD ====================

    /**
     * GET /api/analytics/dashboard?days=30
     * Récupère le tableau de bord analytique complet
     */
    @GetMapping("/dashboard")
    public ApiResponse<EnhancedAnalyticsDashboardDTO> getDashboard(
            @RequestHeader("X-Actor-Id") Long actorId,
            @RequestParam(defaultValue = "30") int days
    ) {
        EnhancedAnalyticsDashboardDTO dashboard = analyticsService.getEnhancedAnalyticsDashboard(actorId, days);
        return ApiResponse.ok(dashboard);
    }

    // ==================== KPIs ====================

    /**
     * GET /api/analytics/kpi/growth-rate?startDate=2026-03-20&endDate=2026-04-20
     */
    @GetMapping("/kpi/growth-rate")
    public ApiResponse<KpiMetricDTO> getGrowthRate(
            @RequestHeader("X-Actor-Id") Long actorId,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        Instant start = Instant.parse(startDate);
        Instant end = Instant.parse(endDate);
        return ApiResponse.ok(analyticsService.calculateGrowthRate(actorId, start, end));
    }

    /**
     * GET /api/analytics/kpi/activity-rate?startDate=2026-03-20&endDate=2026-04-20
     */
    @GetMapping("/kpi/activity-rate")
    public ApiResponse<KpiMetricDTO> getActivityRate(
            @RequestHeader("X-Actor-Id") Long actorId,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        Instant start = Instant.parse(startDate);
        Instant end = Instant.parse(endDate);
        return ApiResponse.ok(analyticsService.calculateActivityRate(actorId, start, end));
    }

    /**
     * GET /api/analytics/kpi/system-load
     */
    @GetMapping("/kpi/system-load")
    public ApiResponse<KpiMetricDTO> getSystemLoad(
            @RequestHeader("X-Actor-Id") Long actorId
    ) {
        return ApiResponse.ok(analyticsService.calculateSystemLoad(actorId));
    }

    /**
     * GET /api/analytics/kpi/success-rate?startDate=2026-03-20&endDate=2026-04-20
     */
    @GetMapping("/kpi/success-rate")
    public ApiResponse<KpiMetricDTO> getSuccessRate(
            @RequestHeader("X-Actor-Id") Long actorId,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        Instant start = Instant.parse(startDate);
        Instant end = Instant.parse(endDate);
        return ApiResponse.ok(analyticsService.calculateSuccessRate(actorId, start, end));
    }

    // ==================== TIME SERIES ====================

    /**
     * GET /api/analytics/timeseries/user-growth?granularity=WEEK&startDate=2026-03-20&endDate=2026-04-20
     */
    @GetMapping("/timeseries/user-growth")
    public ApiResponse<TimeSeriesDataDTO> getUserGrowthTimeSeries(
            @RequestHeader("X-Actor-Id") Long actorId,
            @RequestParam(required = false) String granularity,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        Instant start = Instant.parse(startDate);
        Instant end = Instant.parse(endDate);
        return ApiResponse.ok(analyticsService.getUserGrowthTimeSeries(actorId, granularity, start, end));
    }

    /**
     * GET /api/analytics/timeseries/activity?granularity=WEEK&startDate=2026-03-20&endDate=2026-04-20
     */
    @GetMapping("/timeseries/activity")
    public ApiResponse<TimeSeriesDataDTO> getActivityTimeSeries(
            @RequestHeader("X-Actor-Id") Long actorId,
            @RequestParam(required = false) String granularity,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        Instant start = Instant.parse(startDate);
        Instant end = Instant.parse(endDate);
        return ApiResponse.ok(analyticsService.getActivityTimeSeries(actorId, granularity, start, end));
    }

    /**
     * GET /api/analytics/timeseries/success-rate?granularity=WEEK&startDate=2026-03-20&endDate=2026-04-20
     */
    @GetMapping("/timeseries/success-rate")
    public ApiResponse<TimeSeriesDataDTO> getSuccessRateTimeSeries(
            @RequestHeader("X-Actor-Id") Long actorId,
            @RequestParam(required = false) String granularity,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        Instant start = Instant.parse(startDate);
        Instant end = Instant.parse(endDate);
        return ApiResponse.ok(analyticsService.getSuccessRateTimeSeries(actorId, granularity, start, end));
    }

    // ==================== DRILL-DOWN ====================

    /**
     * GET /api/analytics/drilldown/growth-rate?startDate=2026-03-20&endDate=2026-04-20
     * Récupère les données brutes: formule, variables, et list des nouveaux utilisateurs
     */
    @GetMapping("/drilldown/growth-rate")
    public ApiResponse<DrillDownDataDTO> drillDownGrowthRate(
            @RequestHeader("X-Actor-Id") Long actorId,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        Instant start = Instant.parse(startDate);
        Instant end = Instant.parse(endDate);
        return ApiResponse.ok(analyticsService.drillDownGrowthRate(actorId, start, end));
    }

    /**
     * GET /api/analytics/drilldown/activity-rate?startDate=2026-03-20&endDate=2026-04-20
     */
    @GetMapping("/drilldown/activity-rate")
    public ApiResponse<DrillDownDataDTO> drillDownActivityRate(
            @RequestHeader("X-Actor-Id") Long actorId,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        Instant start = Instant.parse(startDate);
        Instant end = Instant.parse(endDate);
        return ApiResponse.ok(analyticsService.drillDownActivityRate(actorId, start, end));
    }

    /**
     * GET /api/analytics/drilldown/system-load
     */
    @GetMapping("/drilldown/system-load")
    public ApiResponse<DrillDownDataDTO> drillDownSystemLoad(
            @RequestHeader("X-Actor-Id") Long actorId
    ) {
        return ApiResponse.ok(analyticsService.drillDownSystemLoad(actorId));
    }

    /**
     * GET /api/analytics/drilldown/success-rate?startDate=2026-03-20&endDate=2026-04-20
     */
    @GetMapping("/drilldown/success-rate")
    public ApiResponse<DrillDownDataDTO> drillDownSuccessRate(
            @RequestHeader("X-Actor-Id") Long actorId,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        Instant start = Instant.parse(startDate);
        Instant end = Instant.parse(endDate);
        return ApiResponse.ok(analyticsService.drillDownSuccessRate(actorId, start, end));
    }

    // ==================== AGENT PERFORMANCE ====================

    /**
     * GET /api/analytics/agents/ranking?limit=10
     * Classement des agents par score de performance
     */
    @GetMapping("/agents/ranking")
    public ApiResponse<List<AgentPerformanceScoreDTO>> getAgentPerformanceRanking(
            @RequestHeader("X-Actor-Id") Long actorId,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ApiResponse.ok(analyticsService.getAgentPerformanceRanking(actorId, limit));
    }

    /**
     * GET /api/analytics/agents/{agentId}/performance?days=30
     * Score de performance complet d'un agent
     */
    @GetMapping("/agents/{agentId}/performance")
    public ApiResponse<AgentPerformanceScoreDTO> getAgentPerformanceScore(
            @RequestHeader("X-Actor-Id") Long actorId,
            @PathVariable Long agentId,
            @RequestParam(defaultValue = "30") int days
    ) {
        return ApiResponse.ok(analyticsService.calculateAgentPerformanceScore(actorId, agentId, days));
    }

    /**
     * GET /api/analytics/agents/{agentId}/360
     * Vue 360° complète d'un agent (profil, comparaisons, timelines, portfolio)
     */
    @GetMapping("/agents/{agentId}/360")
    public ApiResponse<AgentPerformanceScoreDTO> getAgent360View(
            @RequestHeader("X-Actor-Id") Long actorId,
            @PathVariable Long agentId
    ) {
        return ApiResponse.ok(analyticsService.getAgent360View(actorId, agentId));
    }

    /**
     * GET /api/analytics/agents/{agentId}/drilldown
     * Données brutes pour un agent: tous les logs, actions, clients
     */
    @GetMapping("/agents/{agentId}/drilldown")
    public ApiResponse<DrillDownDataDTO> drillDownAgentPerformance(
            @RequestHeader("X-Actor-Id") Long actorId,
            @PathVariable Long agentId
    ) {
        return ApiResponse.ok(analyticsService.drillDownAgentPerformance(actorId, agentId));
    }

    // ==================== SYSTÈME ====================

    /**
     * GET /api/analytics/system/health
     * Santé du système: score global et détail par composant
     */
    @GetMapping("/system/health")
    public ApiResponse<Map<String, Object>> getSystemHealth(
            @RequestHeader("X-Actor-Id") Long actorId
    ) {
        return ApiResponse.ok(analyticsService.calculateSystemHealth(actorId));
    }

    /**
     * GET /api/analytics/system/compare-periods?days1=30&days2=60
     * Compare les métriques entre deux périodes
     */
    @GetMapping("/system/compare-periods")
    public ApiResponse<Map<String, Double>> comparePeriods(
            @RequestHeader("X-Actor-Id") Long actorId,
            @RequestParam int days1,
            @RequestParam(required = false) Optional<Integer> days2
    ) {
        return ApiResponse.ok(analyticsService.comparePeriods(actorId, days1, days2));
    }
}
