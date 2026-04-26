package com.kredia.dto.audit;

import com.kredia.entity.audit.AuditLog;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.Map;

/**
 * AuditLogDTO: Data Transfer Object for audit log responses
 */
public class AuditLogDTO {
    private Long id;
    private String actionType;
    private String status;
    private String severity;
    private Long actorId;
    private String actorEmail;
    private String actorName;
    private String actorRole;
    private Long targetId;
    private String targetEmail;
    private String targetType;
    private String ipAddress;
    private String userAgent;
    private String endpoint;
    private String httpMethod;
    private Map<String, Object> requestData;
    private Map<String, Object> responseData;
    private Map<String, Object> previousState;
    private Map<String, Object> newState;
    private String changesDescription;
    private Instant timestamp;
    private Long durationMs;
    private String errorMessage;
    private String correlationId;

    // ========== GETTERS ==========
    public Long getId() { return id; }
    public String getActionType() { return actionType; }
    public String getStatus() { return status; }
    public String getSeverity() { return severity; }
    public Long getActorId() { return actorId; }
    public String getActorEmail() { return actorEmail; }
    public String getActorName() { return actorName; }
    public String getActorRole() { return actorRole; }
    public Long getTargetId() { return targetId; }
    public String getTargetEmail() { return targetEmail; }
    public String getTargetType() { return targetType; }
    public String getIpAddress() { return ipAddress; }
    public String getUserAgent() { return userAgent; }
    public String getEndpoint() { return endpoint; }
    public String getHttpMethod() { return httpMethod; }
    public Map<String, Object> getRequestData() { return requestData; }
    public Map<String, Object> getResponseData() { return responseData; }
    public Map<String, Object> getPreviousState() { return previousState; }
    public Map<String, Object> getNewState() { return newState; }
    public String getChangesDescription() { return changesDescription; }
    public Instant getTimestamp() { return timestamp; }
    public Long getDurationMs() { return durationMs; }
    public String getErrorMessage() { return errorMessage; }
    public String getCorrelationId() { return correlationId; }

    // ========== SETTERS ==========
    public void setId(Long id) { this.id = id; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public void setStatus(String status) { this.status = status; }
    public void setSeverity(String severity) { this.severity = severity; }
    public void setActorId(Long actorId) { this.actorId = actorId; }
    public void setActorEmail(String actorEmail) { this.actorEmail = actorEmail; }
    public void setActorName(String actorName) { this.actorName = actorName; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }
    public void setTargetEmail(String targetEmail) { this.targetEmail = targetEmail; }
    public void setTargetType(String targetType) { this.targetType = targetType; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
    public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
    public void setHttpMethod(String httpMethod) { this.httpMethod = httpMethod; }
    public void setRequestData(Map<String, Object> requestData) { this.requestData = requestData; }
    public void setResponseData(Map<String, Object> responseData) { this.responseData = responseData; }
    public void setPreviousState(Map<String, Object> previousState) { this.previousState = previousState; }
    public void setNewState(Map<String, Object> newState) { this.newState = newState; }
    public void setChangesDescription(String changesDescription) { this.changesDescription = changesDescription; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public void setDurationMs(Long durationMs) { this.durationMs = durationMs; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    // ========== CONVERTER ==========
    public static AuditLogDTO fromEntity(AuditLog entity) {
        if (entity == null) return null;
        
        try {
            AuditLogDTO dto = new AuditLogDTO();
            dto.setId(entity.getId());
            dto.setActionType(entity.getActionType() != null ? entity.getActionType().name() : null);
            dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
            dto.setSeverity(entity.getSeverity() != null ? entity.getSeverity().name() : null);
            dto.setActorId(entity.getActorId());
            dto.setActorEmail(entity.getActorEmail());
            dto.setActorName(entity.getActorName());
            dto.setActorRole(entity.getActorRole());
            dto.setTargetId(entity.getTargetId());
            dto.setTargetEmail(entity.getTargetEmail());
            dto.setTargetType(entity.getTargetType());
            dto.setIpAddress(entity.getIpAddress());
            dto.setUserAgent(entity.getUserAgent());
            dto.setEndpoint(entity.getEndpoint());
            dto.setHttpMethod(entity.getHttpMethod());
            dto.setRequestData(parseJson(entity.getRequestData()));
            dto.setResponseData(parseJson(entity.getResponseData()));
            dto.setPreviousState(parseJson(entity.getPreviousState()));
            dto.setNewState(parseJson(entity.getNewState()));
            dto.setChangesDescription(entity.getChangesDescription());
            dto.setTimestamp(entity.getTimestamp());
            dto.setDurationMs(entity.getDurationMs());
            dto.setErrorMessage(entity.getErrorMessage());
            dto.setCorrelationId(entity.getCorrelationId());
            return dto;
        } catch (Exception e) {
            // Return partial DTO on conversion failure
            AuditLogDTO dto = new AuditLogDTO();
            dto.setId(entity.getId());
            dto.setTimestamp(entity.getTimestamp());
            return dto;
        }
    }

    /**
     * Parse JSON string to map
     */
    private static Map<String, Object> parseJson(String json) {
        if (json == null || json.isEmpty()) {
            return null;
        }
        try {
            return new ObjectMapper().readValue(json, Map.class);
        } catch (Exception e) {
            return null;
        }
    }

    // ========== BUILDER ==========
    public static class Builder {
        private AuditLogDTO dto = new AuditLogDTO();

        public Builder id(Long id) { dto.id = id; return this; }
        public Builder actionType(String actionType) { dto.actionType = actionType; return this; }
        public Builder status(String status) { dto.status = status; return this; }
        public Builder severity(String severity) { dto.severity = severity; return this; }
        public Builder actorId(Long actorId) { dto.actorId = actorId; return this; }
        public Builder actorEmail(String actorEmail) { dto.actorEmail = actorEmail; return this; }
        public Builder actorName(String actorName) { dto.actorName = actorName; return this; }
        public Builder actorRole(String actorRole) { dto.actorRole = actorRole; return this; }
        public Builder targetId(Long targetId) { dto.targetId = targetId; return this; }
        public Builder targetEmail(String targetEmail) { dto.targetEmail = targetEmail; return this; }
        public Builder targetType(String targetType) { dto.targetType = targetType; return this; }
        public Builder ipAddress(String ipAddress) { dto.ipAddress = ipAddress; return this; }
        public Builder userAgent(String userAgent) { dto.userAgent = userAgent; return this; }
        public Builder endpoint(String endpoint) { dto.endpoint = endpoint; return this; }
        public Builder httpMethod(String httpMethod) { dto.httpMethod = httpMethod; return this; }
        public Builder requestData(Map<String, Object> requestData) { dto.requestData = requestData; return this; }
        public Builder responseData(Map<String, Object> responseData) { dto.responseData = responseData; return this; }
        public Builder previousState(Map<String, Object> previousState) { dto.previousState = previousState; return this; }
        public Builder newState(Map<String, Object> newState) { dto.newState = newState; return this; }
        public Builder changesDescription(String changesDescription) { dto.changesDescription = changesDescription; return this; }
        public Builder timestamp(Instant timestamp) { dto.timestamp = timestamp; return this; }
        public Builder durationMs(Long durationMs) { dto.durationMs = durationMs; return this; }
        public Builder errorMessage(String errorMessage) { dto.errorMessage = errorMessage; return this; }
        public Builder correlationId(String correlationId) { dto.correlationId = correlationId; return this; }
        public AuditLogDTO build() { return dto; }
    }

    public static Builder builder() {
        return new Builder();
    }
}
