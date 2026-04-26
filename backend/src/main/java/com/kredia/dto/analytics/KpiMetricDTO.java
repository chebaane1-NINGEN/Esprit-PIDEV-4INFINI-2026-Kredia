package com.kredia.dto.analytics;

/**
 * KpiMetricDTO: Wrapper pour chaque KPI avec métadonnées
 * - value: la valeur calculée
 * - label: nom du KPI
 * - unit: unité (%, nombre, secondes)
 * - trend: changement par rapport à la période précédente
 * - lastUpdated: timestamp du dernier calcul
 */
public class KpiMetricDTO {
    private String id;
    private String label;
    private Object value;
    private String unit;
    private Double trend;
    private TrendDirection trendDirection;
    private long lastUpdated;
    private String description;

    public enum TrendDirection {
        UP, DOWN, STABLE
    }

    public KpiMetricDTO() {}

    public KpiMetricDTO(String id, String label, Object value, String unit) {
        this.id = id;
        this.label = label;
        this.value = value;
        this.unit = unit;
        this.lastUpdated = System.currentTimeMillis();
    }

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public Object getValue() { return value; }
    public void setValue(Object value) { this.value = value; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public Double getTrend() { return trend; }
    public void setTrend(Double trend) { this.trend = trend; }

    public TrendDirection getTrendDirection() { return trendDirection; }
    public void setTrendDirection(TrendDirection trendDirection) { this.trendDirection = trendDirection; }

    public long getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(long lastUpdated) { this.lastUpdated = lastUpdated; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
