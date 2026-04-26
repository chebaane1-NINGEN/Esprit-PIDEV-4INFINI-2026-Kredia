-- Create audit_logs table for enterprise audit trail system
-- This table stores comprehensive audit information for all user actions

CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    severity VARCHAR(20) NOT NULL,

    -- Actor information (Who performed the action)
    actor_id BIGINT,
    actor_email VARCHAR(255),
    actor_name VARCHAR(255),
    actor_role VARCHAR(100),

    -- Target information (What was affected)
    target_id BIGINT,
    target_email VARCHAR(255),
    target_type VARCHAR(50),

    -- Location & Network
    ip_address VARCHAR(45),
    user_agent TEXT,
    endpoint VARCHAR(500),
    http_method VARCHAR(10),

    -- Payloads (JSON stored as text)
    request_data LONGTEXT,
    response_data LONGTEXT,
    previous_state LONGTEXT,
    new_state LONGTEXT,
    changes_description LONGTEXT,

    -- Metadata
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    duration_ms BIGINT,
    error_message LONGTEXT,
    error_stacktrace LONGTEXT,
    correlation_id VARCHAR(255),
    archived_at TIMESTAMP NULL,
    internal_notes LONGTEXT,

    -- Indexes for performance
    INDEX idx_audit_timestamp (timestamp DESC),
    INDEX idx_audit_actor (actor_id),
    INDEX idx_audit_target (target_id),
    INDEX idx_audit_action (action_type),
    INDEX idx_audit_status (status)
);

-- Insert initial audit log for system startup
INSERT INTO audit_logs (action_type, status, severity, actor_name, target_type, endpoint, http_method, changes_description, internal_notes)
VALUES ('SYSTEM_CONFIG_CHANGE', 'SUCCESS', 'LOW', 'System', 'SYSTEM', '/api/audit', 'POST', 'Audit trail system initialized', 'Automated migration entry');