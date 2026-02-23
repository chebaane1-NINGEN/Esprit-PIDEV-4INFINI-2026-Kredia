package com.kredia.entity.wallet;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaction_audit_logs")
public class TransactionAuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;
    
    @Column(name = "previous_hash", length = 256)
    private String previousHash;
    
    @Column(name = "data_hash", nullable = false, length = 256)
    private String dataHash;
    
    @Column(name = "blockchain_tx_hash", length = 256)
    private String blockchainTxHash;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public TransactionAuditLog() {}

    public TransactionAuditLog(Long logId, Transaction transaction, String previousHash, String dataHash, String blockchainTxHash, LocalDateTime createdAt) {
        this.logId = logId;
        this.transaction = transaction;
        this.previousHash = previousHash;
        this.dataHash = dataHash;
        this.blockchainTxHash = blockchainTxHash;
        this.createdAt = createdAt;
    }

    public Long getLogId() { return logId; }
    public void setLogId(Long logId) { this.logId = logId; }

    public Transaction getTransaction() { return transaction; }
    public void setTransaction(Transaction transaction) { this.transaction = transaction; }

    public String getPreviousHash() { return previousHash; }
    public void setPreviousHash(String previousHash) { this.previousHash = previousHash; }

    public String getDataHash() { return dataHash; }
    public void setDataHash(String dataHash) { this.dataHash = dataHash; }

    public String getBlockchainTxHash() { return blockchainTxHash; }
    public void setBlockchainTxHash(String blockchainTxHash) { this.blockchainTxHash = blockchainTxHash; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
