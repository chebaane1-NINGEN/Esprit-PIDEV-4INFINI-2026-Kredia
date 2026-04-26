package com.kredia.dto.audit;

import java.util.Map;

/**
 * AuditLogSummary: Dashboard summary of recent audit activity
 */
public class AuditLogSummary {
    private Long totalActionsToday;
    private Long failedActionsToday;
    private Long highSeverityActionsToday;
    private Map<String, Long> actionTypeDistribution;
    private Map<String, Long> severityDistribution;
    private AuditLogDTO mostRecentAction;
    private AuditLogDTO mostRecentFailure;

    // Getters
    public Long getTotalActionsToday() { return totalActionsToday; }
    public Long getFailedActionsToday() { return failedActionsToday; }
    public Long getHighSeverityActionsToday() { return highSeverityActionsToday; }
    public Map<String, Long> getActionTypeDistribution() { return actionTypeDistribution; }
    public Map<String, Long> getSeverityDistribution() { return severityDistribution; }
    public AuditLogDTO getMostRecentAction() { return mostRecentAction; }
    public AuditLogDTO getMostRecentFailure() { return mostRecentFailure; }

    // Setters
    public void setTotalActionsToday(Long totalActionsToday) { this.totalActionsToday = totalActionsToday; }
    public void setFailedActionsToday(Long failedActionsToday) { this.failedActionsToday = failedActionsToday; }
    public void setHighSeverityActionsToday(Long highSeverityActionsToday) { this.highSeverityActionsToday = highSeverityActionsToday; }
    public void setActionTypeDistribution(Map<String, Long> actionTypeDistribution) { this.actionTypeDistribution = actionTypeDistribution; }
    public void setSeverityDistribution(Map<String, Long> severityDistribution) { this.severityDistribution = severityDistribution; }
    public void setMostRecentAction(AuditLogDTO mostRecentAction) { this.mostRecentAction = mostRecentAction; }
    public void setMostRecentFailure(AuditLogDTO mostRecentFailure) { this.mostRecentFailure = mostRecentFailure; }

    // ========== BUILDER ==========
    public static class Builder {
        private AuditLogSummary summary = new AuditLogSummary();

        public Builder totalActionsToday(Long totalActionsToday) { summary.totalActionsToday = totalActionsToday; return this; }
        public Builder failedActionsToday(Long failedActionsToday) { summary.failedActionsToday = failedActionsToday; return this; }
        public Builder highSeverityActionsToday(Long highSeverityActionsToday) { summary.highSeverityActionsToday = highSeverityActionsToday; return this; }
        public Builder actionTypeDistribution(Map<String, Long> actionTypeDistribution) { summary.actionTypeDistribution = actionTypeDistribution; return this; }
        public Builder severityDistribution(Map<String, Long> severityDistribution) { summary.severityDistribution = severityDistribution; return this; }
        public Builder mostRecentAction(AuditLogDTO mostRecentAction) { summary.mostRecentAction = mostRecentAction; return this; }
        public Builder mostRecentFailure(AuditLogDTO mostRecentFailure) { summary.mostRecentFailure = mostRecentFailure; return this; }
        public AuditLogSummary build() { return summary; }
    }

    public static Builder builder() {
        return new Builder();
    }
}

