package com.kredia.entity.investment;

import com.kredia.user.entity.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "portfolio_positions")
public class PortfolioPosition {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "position_id")
    private Long positionId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private InvestmentAsset asset;
    
    @Column(name = "current_quantity", nullable = false, precision = 15, scale = 8)
    private BigDecimal currentQuantity;
    
    @Column(name = "avg_purchase_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal avgPurchasePrice;
    
    @Column(name = "market_value", precision = 15, scale = 2)
    private BigDecimal marketValue;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public PortfolioPosition() {}

    public PortfolioPosition(Long positionId, User user, InvestmentAsset asset, BigDecimal currentQuantity, BigDecimal avgPurchasePrice, BigDecimal marketValue, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.positionId = positionId;
        this.user = user;
        this.asset = asset;
        this.currentQuantity = currentQuantity;
        this.avgPurchasePrice = avgPurchasePrice;
        this.marketValue = marketValue;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getPositionId() { return positionId; }
    public void setPositionId(Long positionId) { this.positionId = positionId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public InvestmentAsset getAsset() { return asset; }
    public void setAsset(InvestmentAsset asset) { this.asset = asset; }

    public BigDecimal getCurrentQuantity() { return currentQuantity; }
    public void setCurrentQuantity(BigDecimal currentQuantity) { this.currentQuantity = currentQuantity; }

    public BigDecimal getAvgPurchasePrice() { return avgPurchasePrice; }
    public void setAvgPurchasePrice(BigDecimal avgPurchasePrice) { this.avgPurchasePrice = avgPurchasePrice; }

    public BigDecimal getMarketValue() { return marketValue; }
    public void setMarketValue(BigDecimal marketValue) { this.marketValue = marketValue; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
