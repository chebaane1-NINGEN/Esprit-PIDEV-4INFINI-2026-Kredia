package com.kredia.entity.support;

import com.kredia.enums.ReclamationStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reclamation_history", indexes = {
        @Index(name = "idx_hist_reclamation", columnList = "reclamation_id"),
        @Index(name = "idx_hist_changed", columnList = "changed_at")
})
public class ReclamationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reclamation_id", nullable = false)
    private Reclamation reclamation;

    @Column(name = "user_id")
    private Long userId; // who did the action (agent/admin/system)

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", nullable = false)
    private ReclamationStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false)
    private ReclamationStatus newStatus;

    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;

    @Column(length = 500)
    private String note;

    public ReclamationHistory() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Reclamation getReclamation() {
        return reclamation;
    }

    public void setReclamation(Reclamation reclamation) {
        this.reclamation = reclamation;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public ReclamationStatus getOldStatus() {
        return oldStatus;
    }

    public void setOldStatus(ReclamationStatus oldStatus) {
        this.oldStatus = oldStatus;
    }

    public ReclamationStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(ReclamationStatus newStatus) {
        this.newStatus = newStatus;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    @PrePersist
    void onCreate() {
        changedAt = LocalDateTime.now();
    }
}
