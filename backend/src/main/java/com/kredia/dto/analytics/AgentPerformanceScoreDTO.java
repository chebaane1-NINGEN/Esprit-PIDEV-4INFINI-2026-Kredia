package com.kredia.dto.analytics;

import java.util.List;
import java.util.Map;

/**
 * AgentPerformanceScoreDTO: Score de performance complet pour un agent
 * Formule: (successRate * 0.6) + (volumeScore * 0.3) + (speedScore * 0.1)
 * où:
 * - successRate: (approvals / total_actions) * 100
 * - volumeScore: (agent_actions / avg_team_actions) * 100
 * - speedScore: (100 - ((avg_time - min_team_time) / (max_team_time - min_team_time) * 100))
 */
public class AgentPerformanceScoreDTO {
    private long agentId;
    private String agentName;
    private String agentEmail;
    private String agentRole;
    
    // === Composants du Score ===
    private double successRate; // Taux d'approbation (0-100)
    private double volumeScore; // Score de volume (0-100)
    private double speedScore; // Score de rapidité (0-100)
    private double finalPerformanceScore; // Score final (0-100)
    private String performanceRank; // EXCELLENT, VERY_GOOD, GOOD, FAIR, POOR
    
    // === Statistiques Brutes ===
    private long totalActions;
    private long approvalCount;
    private long rejectionCount;
    private long numberOfClientsHandled;
    private double averageProcessingTimeSeconds;
    
    // === Comparaison avec l'équipe ===
    private double teamAverageSuccessRate;
    private double teamAverageVolume;
    private double teamAverageProcessingTime;
    private long teamSize;
    private String positionInTeam; // Ex: "1/5 agents"
    
    // === Données Temporelles ===
    private TimeSeriesDataDTO activityTimeSeries;
    private TimeSeriesDataDTO successRateTimeSeries;
    private TimeSeriesDataDTO processingTimeTimeSeries;
    
    // === Portfolio Client ===
    private long activeClientsCount;
    private long totalClientsHandled;
    private double clientRetentionRate;
    private List<Map<String, Object>> topClients;
    
    // === Audit Trail ===
    private List<Map<String, Object>> recentActivities;
    private Map<String, Long> actionTypeBreakdown; // Ex: {APPROVAL: 45, REJECTION: 5, ...}
    
    // === KPIs Additionnels ===
    private double qualityScore; // Basé sur les erreurs, corrections, etc
    private double customerSatisfactionScore; // Si disponible
    private long lastActivityTime;
    private String lastActivityDescription;

    public AgentPerformanceScoreDTO() {}

    // Getters & Setters
    public long getAgentId() { return agentId; }
    public void setAgentId(long agentId) { this.agentId = agentId; }

    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }

    public String getAgentEmail() { return agentEmail; }
    public void setAgentEmail(String agentEmail) { this.agentEmail = agentEmail; }

    public String getAgentRole() { return agentRole; }
    public void setAgentRole(String agentRole) { this.agentRole = agentRole; }

    public double getSuccessRate() { return successRate; }
    public void setSuccessRate(double successRate) { this.successRate = successRate; }

    public double getVolumeScore() { return volumeScore; }
    public void setVolumeScore(double volumeScore) { this.volumeScore = volumeScore; }

    public double getSpeedScore() { return speedScore; }
    public void setSpeedScore(double speedScore) { this.speedScore = speedScore; }

    public double getFinalPerformanceScore() { return finalPerformanceScore; }
    public void setFinalPerformanceScore(double finalPerformanceScore) { this.finalPerformanceScore = finalPerformanceScore; }

    public String getPerformanceRank() { return performanceRank; }
    public void setPerformanceRank(String performanceRank) { this.performanceRank = performanceRank; }

    public long getTotalActions() { return totalActions; }
    public void setTotalActions(long totalActions) { this.totalActions = totalActions; }

    public long getApprovalCount() { return approvalCount; }
    public void setApprovalCount(long approvalCount) { this.approvalCount = approvalCount; }

    public long getRejectionCount() { return rejectionCount; }
    public void setRejectionCount(long rejectionCount) { this.rejectionCount = rejectionCount; }

    public long getNumberOfClientsHandled() { return numberOfClientsHandled; }
    public void setNumberOfClientsHandled(long numberOfClientsHandled) { this.numberOfClientsHandled = numberOfClientsHandled; }

    public double getAverageProcessingTimeSeconds() { return averageProcessingTimeSeconds; }
    public void setAverageProcessingTimeSeconds(double averageProcessingTimeSeconds) { this.averageProcessingTimeSeconds = averageProcessingTimeSeconds; }

    public double getTeamAverageSuccessRate() { return teamAverageSuccessRate; }
    public void setTeamAverageSuccessRate(double teamAverageSuccessRate) { this.teamAverageSuccessRate = teamAverageSuccessRate; }

    public double getTeamAverageVolume() { return teamAverageVolume; }
    public void setTeamAverageVolume(double teamAverageVolume) { this.teamAverageVolume = teamAverageVolume; }

    public double getTeamAverageProcessingTime() { return teamAverageProcessingTime; }
    public void setTeamAverageProcessingTime(double teamAverageProcessingTime) { this.teamAverageProcessingTime = teamAverageProcessingTime; }

    public long getTeamSize() { return teamSize; }
    public void setTeamSize(long teamSize) { this.teamSize = teamSize; }

    public String getPositionInTeam() { return positionInTeam; }
    public void setPositionInTeam(String positionInTeam) { this.positionInTeam = positionInTeam; }

    public TimeSeriesDataDTO getActivityTimeSeries() { return activityTimeSeries; }
    public void setActivityTimeSeries(TimeSeriesDataDTO activityTimeSeries) { this.activityTimeSeries = activityTimeSeries; }

    public TimeSeriesDataDTO getSuccessRateTimeSeries() { return successRateTimeSeries; }
    public void setSuccessRateTimeSeries(TimeSeriesDataDTO successRateTimeSeries) { this.successRateTimeSeries = successRateTimeSeries; }

    public TimeSeriesDataDTO getProcessingTimeTimeSeries() { return processingTimeTimeSeries; }
    public void setProcessingTimeTimeSeries(TimeSeriesDataDTO processingTimeTimeSeries) { this.processingTimeTimeSeries = processingTimeTimeSeries; }

    public long getActiveClientsCount() { return activeClientsCount; }
    public void setActiveClientsCount(long activeClientsCount) { this.activeClientsCount = activeClientsCount; }

    public long getTotalClientsHandled() { return totalClientsHandled; }
    public void setTotalClientsHandled(long totalClientsHandled) { this.totalClientsHandled = totalClientsHandled; }

    public double getClientRetentionRate() { return clientRetentionRate; }
    public void setClientRetentionRate(double clientRetentionRate) { this.clientRetentionRate = clientRetentionRate; }

    public List<Map<String, Object>> getTopClients() { return topClients; }
    public void setTopClients(List<Map<String, Object>> topClients) { this.topClients = topClients; }

    public List<Map<String, Object>> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<Map<String, Object>> recentActivities) { this.recentActivities = recentActivities; }

    public Map<String, Long> getActionTypeBreakdown() { return actionTypeBreakdown; }
    public void setActionTypeBreakdown(Map<String, Long> actionTypeBreakdown) { this.actionTypeBreakdown = actionTypeBreakdown; }

    public double getQualityScore() { return qualityScore; }
    public void setQualityScore(double qualityScore) { this.qualityScore = qualityScore; }

    public double getCustomerSatisfactionScore() { return customerSatisfactionScore; }
    public void setCustomerSatisfactionScore(double customerSatisfactionScore) { this.customerSatisfactionScore = customerSatisfactionScore; }

    public long getLastActivityTime() { return lastActivityTime; }
    public void setLastActivityTime(long lastActivityTime) { this.lastActivityTime = lastActivityTime; }

    public String getLastActivityDescription() { return lastActivityDescription; }
    public void setLastActivityDescription(String lastActivityDescription) { this.lastActivityDescription = lastActivityDescription; }
}
