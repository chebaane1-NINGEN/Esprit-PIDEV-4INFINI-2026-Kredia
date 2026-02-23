package com.kredia.entity.investment;

import com.kredia.enums.AssetCategory;
import com.kredia.enums.RiskLevel;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "investment_assets")
public class InvestmentAsset {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "asset_id")
    private Long assetId;
    
    @Column(name = "symbol", nullable = false, unique = true, length = 20)
    private String symbol;
    
    @Column(name = "asset_name", nullable = false, length = 200)
    private String assetName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private AssetCategory category;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false)
    private RiskLevel riskLevel;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "asset", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<InvestmentOrder> orders;
    
    @OneToMany(mappedBy = "asset", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PortfolioPosition> portfolioPositions;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public InvestmentAsset() {}

    public InvestmentAsset(Long assetId, String symbol, String assetName, AssetCategory category, RiskLevel riskLevel, LocalDateTime createdAt, List<InvestmentOrder> orders, List<PortfolioPosition> portfolioPositions) {
        this.assetId = assetId;
        this.symbol = symbol;
        this.assetName = assetName;
        this.category = category;
        this.riskLevel = riskLevel;
        this.createdAt = createdAt;
        this.orders = orders;
        this.portfolioPositions = portfolioPositions;
    }

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getAssetName() { return assetName; }
    public void setAssetName(String assetName) { this.assetName = assetName; }

    public AssetCategory getCategory() { return category; }
    public void setCategory(AssetCategory category) { this.category = category; }

    public RiskLevel getRiskLevel() { return riskLevel; }
    public void setRiskLevel(RiskLevel riskLevel) { this.riskLevel = riskLevel; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<InvestmentOrder> getOrders() { return orders; }
    public void setOrders(List<InvestmentOrder> orders) { this.orders = orders; }

    public List<PortfolioPosition> getPortfolioPositions() { return portfolioPositions; }
    public void setPortfolioPositions(List<PortfolioPosition> portfolioPositions) { this.portfolioPositions = portfolioPositions; }
}
