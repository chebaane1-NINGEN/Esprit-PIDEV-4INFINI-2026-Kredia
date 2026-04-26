package com.kredia.dto.audit;

/**
 * AuditLogCreateRequest: Create audit log (typically called by interceptor/AOP)
 */
public class AuditLogCreateRequest {
    private String actionType;
    private String status;
    private Long actorId;
    private String actorEmail;
    private String actorName;
    private String actorRole;
    private Long targetId;
    private String targetEmail;
    private String targetType;
    private String endpoint;
    private String httpMethod;
    private String requestData;
    private String responseData;
    private String previousState;
    private String newState;
    private String ipAddress;
    private String userAgent;
    private Long durationMs;
    private String errorMessage;

    // Getters
    public String getActionType() { return actionType; }
    public String getStatus() { return status; }
    public Long getActorId() { return actorId; }
    public String getActorEmail() { return actorEmail; }
    public String getActorName() { return actorName; }
    public String getActorRole() { return actorRole; }
    public Long getTargetId() { return targetId; }
    public String getTargetEmail() { return targetEmail; }
    public String getTargetType() { return targetType; }
    public String getEndpoint() { return endpoint; }
    public String getHttpMethod() { return httpMethod; }
    public String getRequestData() { return requestData; }
    public String getResponseData() { return responseData; }
    public String getPreviousState() { return previousState; }
    public String getNewState() { return newState; }
    public String getIpAddress() { return ipAddress; }
    public String getUserAgent() { return userAgent; }
    public Long getDurationMs() { return durationMs; }
    public String getErrorMessage() { return errorMessage; }

    // Setters
    public void setActionType(String actionType) { this.actionType = actionType; }
    public void setStatus(String status) { this.status = status; }
    public void setActorId(Long actorId) { this.actorId = actorId; }
    public void setActorEmail(String actorEmail) { this.actorEmail = actorEmail; }
    public void setActorName(String actorName) { this.actorName = actorName; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }
    public void setTargetEmail(String targetEmail) { this.targetEmail = targetEmail; }
    public void setTargetType(String targetType) { this.targetType = targetType; }
    public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
    public void setHttpMethod(String httpMethod) { this.httpMethod = httpMethod; }
    public void setRequestData(String requestData) { this.requestData = requestData; }
    public void setResponseData(String responseData) { this.responseData = responseData; }
    public void setPreviousState(String previousState) { this.previousState = previousState; }
    public void setNewState(String newState) { this.newState = newState; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
    public void setDurationMs(Long durationMs) { this.durationMs = durationMs; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}

