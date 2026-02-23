package com.kredia.entity.support;

import com.kredia.enums.ReclamationStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reclamation_history")
public class ReclamationHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reclamation_id", nullable = false)
    private Reclamation reclamation;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "old_status")
    private ReclamationStatus oldStatus;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false)
    private ReclamationStatus newStatus;
    
    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt;
    
    @Column(name = "note", length = 1000)
    private String note;
    
    @Column(name = "changed_by")
    private String changedBy;
    
    @PrePersist
    protected void onCreate() {
        changedAt = LocalDateTime.now();
    }

    public ReclamationHistory() {}

    public ReclamationHistory(Long historyId, Reclamation reclamation, ReclamationStatus oldStatus, ReclamationStatus newStatus, LocalDateTime changedAt, String note, String changedBy) {
        this.historyId = historyId;
        this.reclamation = reclamation;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.changedAt = changedAt;
        this.note = note;
        this.changedBy = changedBy;
    }

    public Long getHistoryId() { return historyId; }
    public void setHistoryId(Long historyId) { this.historyId = historyId; }

    public Reclamation getReclamation() { return reclamation; }
    public void setReclamation(Reclamation reclamation) { this.reclamation = reclamation; }

    public ReclamationStatus getOldStatus() { return oldStatus; }
    public void setOldStatus(ReclamationStatus oldStatus) { this.oldStatus = oldStatus; }

    public ReclamationStatus getNewStatus() { return newStatus; }
    public void setNewStatus(ReclamationStatus newStatus) { this.newStatus = newStatus; }

    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }
}
