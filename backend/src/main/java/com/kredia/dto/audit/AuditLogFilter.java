package com.kredia.dto.audit;

import java.time.Instant;

/**
 * AuditLogFilter: Filter criteria for querying audit logs
 */
public class AuditLogFilter {
    private Instant startDate;
    private Instant endDate;
    private String actionType;
    private String severity;
    private String status;
    private Long actorId;
    private Long targetId;
    private String ipAddress;
    private int page = 0;
    private int pageSize = 20;
    private String sortBy = "timestamp";
    private String sortDirection = "DESC";

    // Getters
    public Instant getStartDate() { return startDate; }
    public Instant getEndDate() { return endDate; }
    public String getActionType() { return actionType; }
    public String getSeverity() { return severity; }
    public String getStatus() { return status; }
    public Long getActorId() { return actorId; }
    public Long getTargetId() { return targetId; }
    public String getIpAddress() { return ipAddress; }
    public int getPage() { return page; }
    public int getPageSize() { return pageSize; }
    public String getSortBy() { return sortBy; }
    public String getSortDirection() { return sortDirection; }

    // Setters
    public void setStartDate(Instant startDate) { this.startDate = startDate; }
    public void setEndDate(Instant endDate) { this.endDate = endDate; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public void setSeverity(String severity) { this.severity = severity; }
    public void setStatus(String status) { this.status = status; }
    public void setActorId(Long actorId) { this.actorId = actorId; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public void setPage(int page) { this.page = page; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }
    public void setSortDirection(String sortDirection) { this.sortDirection = sortDirection; }

    // ========== BUILDER ==========
    public static class Builder {
        private AuditLogFilter filter = new AuditLogFilter();

        public Builder startDate(Instant startDate) { filter.startDate = startDate; return this; }
        public Builder endDate(Instant endDate) { filter.endDate = endDate; return this; }
        public Builder actionType(String actionType) { filter.actionType = actionType; return this; }
        public Builder severity(String severity) { filter.severity = severity; return this; }
        public Builder status(String status) { filter.status = status; return this; }
        public Builder actorId(Long actorId) { filter.actorId = actorId; return this; }
        public Builder targetId(Long targetId) { filter.targetId = targetId; return this; }
        public Builder ipAddress(String ipAddress) { filter.ipAddress = ipAddress; return this; }
        public Builder page(int page) { filter.page = page; return this; }
        public Builder pageSize(int pageSize) { filter.pageSize = pageSize; return this; }
        public Builder sortBy(String sortBy) { filter.sortBy = sortBy; return this; }
        public Builder sortDirection(String sortDirection) { filter.sortDirection = sortDirection; return this; }
        public AuditLogFilter build() { return filter; }
    }

    public static Builder builder() {
        return new Builder();
    }
}

