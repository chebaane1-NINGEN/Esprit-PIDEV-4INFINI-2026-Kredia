package com.kredia.entity.audit;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * AuditLog Entity: Enterprise audit trail with complete action tracking
 * 
 * Stores: What (ActionType), Who (ActorId/ActorEmail), When (Timestamp),
 *         Where (Endpoint, IP), Why (Payloads), and How (Status, Diff)
 */
@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_timestamp", columnList = "timestamp DESC"),
    @Index(name = "idx_audit_actor", columnList = "actor_id"),
    @Index(name = "idx_audit_target", columnList = "target_id"),
    @Index(name = "idx_audit_action", columnList = "action_type"),
    @Index(name = "idx_audit_status", columnList = "status")
})
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ========== ACTION & CLASSIFICATION ==========
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AuditActionType actionType;

    /**
     * Status: SUCCESS, FAILED, PARTIAL, PENDING
     */
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AuditStatus status;

    /**
     * Severity: HIGH (DELETE, BLOCK), MEDIUM (MODIFY), LOW (READ, VIEW)
     */
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AuditSeverity severity;

    // ========== ACTOR (Who) ==========
    @Column(name = "actor_id")
    private Long actorId;

    @Column(name = "actor_email")
    private String actorEmail;

    @Column(name = "actor_name")
    private String actorName;

    @Column(name = "actor_role")
    private String actorRole;

    // ========== TARGET (Affected) ==========
    @Column(name = "target_id")
    private Long targetId;

    @Column(name = "target_email")
    private String targetEmail;

    @Column(name = "target_type")
    private String targetType; // USER, CREDIT, TRANSACTION, etc.

    // ========== LOCATION & NETWORK ==========
    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "endpoint")
    private String endpoint; // e.g., POST /api/users/create

    @Column(name = "http_method")
    private String httpMethod; // GET, POST, PUT, DELETE

    // ========== PAYLOADS & DIFF ==========
    @Column(name = "request_data", columnDefinition = "LONGTEXT")
    private String requestData; // JSON

    @Column(name = "response_data", columnDefinition = "LONGTEXT")
    private String responseData; // JSON

    @Column(name = "previous_state", columnDefinition = "LONGTEXT")
    private String previousState; // JSON (for UPDATE audits)

    @Column(name = "new_state", columnDefinition = "LONGTEXT")
    private String newState; // JSON (for UPDATE audits)

    @Column(name = "changes_description", columnDefinition = "LONGTEXT")
    private String changesDescription; // Human-readable diff

    // ========== METADATA ==========
    @Column(nullable = false)
    private Instant timestamp;

    @Column(name = "duration_ms")
    private Long durationMs; // Request processing time

    @Column(name = "error_message", columnDefinition = "LONGTEXT")
    private String errorMessage; // If status=FAILED (optional)

    @Column(name = "error_stacktrace", columnDefinition = "LONGTEXT")
    private String errorStacktrace; // If status=FAILED (optional)

    @Column(name = "correlation_id")
    private String correlationId; // For linking related audits

    @Column(name = "archived_at")
    private Instant archivedAt; // For cold storage (null = not archived)

    @Column(name = "internal_notes", columnDefinition = "LONGTEXT")
    private String internalNotes; // Optional notes for future investigations

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = Instant.now();
        }
        // Auto-calculate severity if not set
        if (this.severity == null && this.actionType != null) {
            this.severity = calculateSeverity(this.actionType);
        }
    }

    /**
     * Determine severity based on action type
     */
    private AuditSeverity calculateSeverity(AuditActionType actionType) {
        return switch (actionType) {
            case DELETE_USER, BLOCK_USER, DELETE_CREDIT, DELETE_TRANSACTION -> AuditSeverity.HIGH;
            case CREATE_USER, UPDATE_USER, UPDATE_CREDIT, MODIFY_SETTINGS -> AuditSeverity.MEDIUM;
            case LOGIN, LOGOUT, VIEW -> AuditSeverity.LOW;
            default -> AuditSeverity.MEDIUM;
        };
    }

    // ========== GETTERS ==========
    public Long getId() { return id; }
    public AuditActionType getActionType() { return actionType; }
    public AuditStatus getStatus() { return status; }
    public AuditSeverity getSeverity() { return severity; }
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
    public String getRequestData() { return requestData; }
    public String getResponseData() { return responseData; }
    public String getPreviousState() { return previousState; }
    public String getNewState() { return newState; }
    public String getChangesDescription() { return changesDescription; }
    public Instant getTimestamp() { return timestamp; }
    public Long getDurationMs() { return durationMs; }
    public String getErrorMessage() { return errorMessage; }
    public String getErrorStacktrace() { return errorStacktrace; }
    public String getCorrelationId() { return correlationId; }
    public Instant getArchivedAt() { return archivedAt; }
    public String getInternalNotes() { return internalNotes; }

    // ========== SETTERS ==========
    public void setId(Long id) { this.id = id; }
    public void setActionType(AuditActionType actionType) { this.actionType = actionType; }
    public void setStatus(AuditStatus status) { this.status = status; }
    public void setSeverity(AuditSeverity severity) { this.severity = severity; }
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
    public void setRequestData(String requestData) { this.requestData = requestData; }
    public void setResponseData(String responseData) { this.responseData = responseData; }
    public void setPreviousState(String previousState) { this.previousState = previousState; }
    public void setNewState(String newState) { this.newState = newState; }
    public void setChangesDescription(String changesDescription) { this.changesDescription = changesDescription; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public void setDurationMs(Long durationMs) { this.durationMs = durationMs; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public void setErrorStacktrace(String errorStacktrace) { this.errorStacktrace = errorStacktrace; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }
    public void setArchivedAt(Instant archivedAt) { this.archivedAt = archivedAt; }
    public void setInternalNotes(String internalNotes) { this.internalNotes = internalNotes; }

    // ========== ENUMS ==========
    public enum AuditActionType {
        // User Management
        LOGIN, LOGOUT, CREATE_USER, UPDATE_USER, DELETE_USER, BLOCK_USER, RESET_PASSWORD, CHANGE_PERMISSIONS,
        
        // Credit Management
        CREATE_CREDIT, UPDATE_CREDIT, DELETE_CREDIT, APPROVE_CREDIT, REJECT_CREDIT,
        
        // Transaction Management
        CREATE_TRANSACTION, UPDATE_TRANSACTION, DELETE_TRANSACTION, REVERSE_TRANSACTION,
        
        // System Actions
        CREATE_AUDIT_LOG, EXPORT_DATA, IMPORT_DATA, SYSTEM_CONFIG_CHANGE,
        
        // Generic
        VIEW, MODIFY_SETTINGS, GENERATE_REPORT, SEND_NOTIFICATION
    }

    public enum AuditStatus {
        SUCCESS, FAILED, PARTIAL, PENDING, CANCELLED
    }

    public enum AuditSeverity {
        LOW(1), MEDIUM(2), HIGH(3), CRITICAL(4);

        public final int weight;
        AuditSeverity(int weight) {
            this.weight = weight;
        }
    }

    // ========== BUILDER ==========
    public static AuditLogBuilder builder() {
        return new AuditLogBuilder();
    }

    public static class AuditLogBuilder {
        private Long id;
        private AuditActionType actionType;
        private AuditStatus status;
        private AuditSeverity severity;
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
        private String requestData;
        private String responseData;
        private String previousState;
        private String newState;
        private String changesDescription;
        private Instant timestamp;
        private Long durationMs;
        private String errorMessage;
        private String errorStacktrace;
        private String correlationId;
        private Instant archivedAt;
        private String internalNotes;

        public AuditLogBuilder id(Long id) { this.id = id; return this; }
        public AuditLogBuilder actionType(AuditActionType actionType) { this.actionType = actionType; return this; }
        public AuditLogBuilder status(AuditStatus status) { this.status = status; return this; }
        public AuditLogBuilder severity(AuditSeverity severity) { this.severity = severity; return this; }
        public AuditLogBuilder actorId(Long actorId) { this.actorId = actorId; return this; }
        public AuditLogBuilder actorEmail(String actorEmail) { this.actorEmail = actorEmail; return this; }
        public AuditLogBuilder actorName(String actorName) { this.actorName = actorName; return this; }
        public AuditLogBuilder actorRole(String actorRole) { this.actorRole = actorRole; return this; }
        public AuditLogBuilder targetId(Long targetId) { this.targetId = targetId; return this; }
        public AuditLogBuilder targetEmail(String targetEmail) { this.targetEmail = targetEmail; return this; }
        public AuditLogBuilder targetType(String targetType) { this.targetType = targetType; return this; }
        public AuditLogBuilder ipAddress(String ipAddress) { this.ipAddress = ipAddress; return this; }
        public AuditLogBuilder userAgent(String userAgent) { this.userAgent = userAgent; return this; }
        public AuditLogBuilder endpoint(String endpoint) { this.endpoint = endpoint; return this; }
        public AuditLogBuilder httpMethod(String httpMethod) { this.httpMethod = httpMethod; return this; }
        public AuditLogBuilder requestData(String requestData) { this.requestData = requestData; return this; }
        public AuditLogBuilder responseData(String responseData) { this.responseData = responseData; return this; }
        public AuditLogBuilder previousState(String previousState) { this.previousState = previousState; return this; }
        public AuditLogBuilder newState(String newState) { this.newState = newState; return this; }
        public AuditLogBuilder changesDescription(String changesDescription) { this.changesDescription = changesDescription; return this; }
        public AuditLogBuilder timestamp(Instant timestamp) { this.timestamp = timestamp; return this; }
        public AuditLogBuilder durationMs(Long durationMs) { this.durationMs = durationMs; return this; }
        public AuditLogBuilder errorMessage(String errorMessage) { this.errorMessage = errorMessage; return this; }
        public AuditLogBuilder errorStacktrace(String errorStacktrace) { this.errorStacktrace = errorStacktrace; return this; }
        public AuditLogBuilder correlationId(String correlationId) { this.correlationId = correlationId; return this; }
        public AuditLogBuilder archivedAt(Instant archivedAt) { this.archivedAt = archivedAt; return this; }
        public AuditLogBuilder internalNotes(String internalNotes) { this.internalNotes = internalNotes; return this; }

        public AuditLog build() {
            AuditLog log = new AuditLog();
            log.id = this.id;
            log.actionType = this.actionType;
            log.status = this.status;
            log.severity = this.severity;
            log.actorId = this.actorId;
            log.actorEmail = this.actorEmail;
            log.actorName = this.actorName;
            log.actorRole = this.actorRole;
            log.targetId = this.targetId;
            log.targetEmail = this.targetEmail;
            log.targetType = this.targetType;
            log.ipAddress = this.ipAddress;
            log.userAgent = this.userAgent;
            log.endpoint = this.endpoint;
            log.httpMethod = this.httpMethod;
            log.requestData = this.requestData;
            log.responseData = this.responseData;
            log.previousState = this.previousState;
            log.newState = this.newState;
            log.changesDescription = this.changesDescription;
            log.timestamp = this.timestamp;
            log.durationMs = this.durationMs;
            log.errorMessage = this.errorMessage;
            log.errorStacktrace = this.errorStacktrace;
            log.correlationId = this.correlationId;
            log.archivedAt = this.archivedAt;
            log.internalNotes = this.internalNotes;
            return log;
        }
    }
}
