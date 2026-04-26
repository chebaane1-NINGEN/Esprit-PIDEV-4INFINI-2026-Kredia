package com.kredia.dto.analytics;

import java.util.List;
import java.util.Map;

/**
 * EnhancedAnalyticsDashboardDTO: Vue agrégée complète du tableau de bord analytique
 * Contient:
 * - KPI cards: Métriques clés en temps réel
 * - Charts: Données de séries temporelles pour les graphiques
 * - System status: Santé du système
 * - Comparatives: Comparaisons par période
 */
public class EnhancedAnalyticsDashboardDTO {
    private long generatedAt;
    private String period; // Ex: "Derniers 30 jours"
    
    // === KPIs Principales ===
    private KpiMetricDTO growthRate;
    private KpiMetricDTO activityRate;
    private KpiMetricDTO systemLoad;
    private KpiMetricDTO successRate;
    
    // === Statistiques Globales ===
    private long totalUsers;
    private long totalClients;
    private long totalAgents;
    private long activeUsers;
    private long blockedUsers;
    private long suspendedUsers;
    
    // === Activité ===
    private long totalActions;
    private long approvalCount;
    private long rejectionCount;
    
    // === Données de Séries Temporelles ===
    private TimeSeriesDataDTO userGrowthTimeSeries;
    private TimeSeriesDataDTO activityTimeSeries;
    private TimeSeriesDataDTO successRateTimeSeries;
    
    // === Santé du Système ===
    private double systemHealthScore; // 0-100
    private String systemHealthStatus; // EXCELLENT, GOOD, WARNING, CRITICAL
    private Map<String, Integer> componentHealth; // Ex: {database: 95, api: 98, cache: 100}
    
    // === Comparaisons ===
    private Map<String, Double> periodComparison; // Ex: {current: 150, previous: 120, growth: +25%}
    
    // === Distribution ===
    private Map<String, Long> userRoleDistribution;
    private Map<String, Long> userStatusDistribution;
    private Map<String, Long> actionTypeDistribution;

    public EnhancedAnalyticsDashboardDTO() {
        this.generatedAt = System.currentTimeMillis();
    }

    // Getters & Setters
    public long getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(long generatedAt) { this.generatedAt = generatedAt; }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public KpiMetricDTO getGrowthRate() { return growthRate; }
    public void setGrowthRate(KpiMetricDTO growthRate) { this.growthRate = growthRate; }

    public KpiMetricDTO getActivityRate() { return activityRate; }
    public void setActivityRate(KpiMetricDTO activityRate) { this.activityRate = activityRate; }

    public KpiMetricDTO getSystemLoad() { return systemLoad; }
    public void setSystemLoad(KpiMetricDTO systemLoad) { this.systemLoad = systemLoad; }

    public KpiMetricDTO getSuccessRate() { return successRate; }
    public void setSuccessRate(KpiMetricDTO successRate) { this.successRate = successRate; }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalClients() { return totalClients; }
    public void setTotalClients(long totalClients) { this.totalClients = totalClients; }

    public long getTotalAgents() { return totalAgents; }
    public void setTotalAgents(long totalAgents) { this.totalAgents = totalAgents; }

    public long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }

    public long getBlockedUsers() { return blockedUsers; }
    public void setBlockedUsers(long blockedUsers) { this.blockedUsers = blockedUsers; }

    public long getSuspendedUsers() { return suspendedUsers; }
    public void setSuspendedUsers(long suspendedUsers) { this.suspendedUsers = suspendedUsers; }

    public long getTotalActions() { return totalActions; }
    public void setTotalActions(long totalActions) { this.totalActions = totalActions; }

    public long getApprovalCount() { return approvalCount; }
    public void setApprovalCount(long approvalCount) { this.approvalCount = approvalCount; }

    public long getRejectionCount() { return rejectionCount; }
    public void setRejectionCount(long rejectionCount) { this.rejectionCount = rejectionCount; }

    public TimeSeriesDataDTO getUserGrowthTimeSeries() { return userGrowthTimeSeries; }
    public void setUserGrowthTimeSeries(TimeSeriesDataDTO userGrowthTimeSeries) { this.userGrowthTimeSeries = userGrowthTimeSeries; }

    public TimeSeriesDataDTO getActivityTimeSeries() { return activityTimeSeries; }
    public void setActivityTimeSeries(TimeSeriesDataDTO activityTimeSeries) { this.activityTimeSeries = activityTimeSeries; }

    public TimeSeriesDataDTO getSuccessRateTimeSeries() { return successRateTimeSeries; }
    public void setSuccessRateTimeSeries(TimeSeriesDataDTO successRateTimeSeries) { this.successRateTimeSeries = successRateTimeSeries; }

    public double getSystemHealthScore() { return systemHealthScore; }
    public void setSystemHealthScore(double systemHealthScore) { this.systemHealthScore = systemHealthScore; }

    public String getSystemHealthStatus() { return systemHealthStatus; }
    public void setSystemHealthStatus(String systemHealthStatus) { this.systemHealthStatus = systemHealthStatus; }

    public Map<String, Integer> getComponentHealth() { return componentHealth; }
    public void setComponentHealth(Map<String, Integer> componentHealth) { this.componentHealth = componentHealth; }

    public Map<String, Double> getPeriodComparison() { return periodComparison; }
    public void setPeriodComparison(Map<String, Double> periodComparison) { this.periodComparison = periodComparison; }

    public Map<String, Long> getUserRoleDistribution() { return userRoleDistribution; }
    public void setUserRoleDistribution(Map<String, Long> userRoleDistribution) { this.userRoleDistribution = userRoleDistribution; }

    public Map<String, Long> getUserStatusDistribution() { return userStatusDistribution; }
    public void setUserStatusDistribution(Map<String, Long> userStatusDistribution) { this.userStatusDistribution = userStatusDistribution; }

    public Map<String, Long> getActionTypeDistribution() { return actionTypeDistribution; }
    public void setActionTypeDistribution(Map<String, Long> actionTypeDistribution) { this.actionTypeDistribution = actionTypeDistribution; }
}
