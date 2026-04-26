package com.kredia.dto.analytics;

import java.util.List;
import java.util.Map;

/**
 * TimeSeriesDataDTO: Données agrégées par période (jour, semaine, mois, custom)
 * Utilisé pour générer les graphiques sur le tableau de bord
 */
public class TimeSeriesDataDTO {
    private String metric;
    private String granularity; // DAY, WEEK, MONTH, CUSTOM
    private List<String> labels;
    private List<Long> values;
    private Map<String, Long> breakdown; // Breakdown par catégorie (ex: par rôle, par statut)
    private long totalValue;
    private long averageValue;
    private long peakValue;
    private String peakDate;

    public TimeSeriesDataDTO() {}

    public TimeSeriesDataDTO(String metric, String granularity) {
        this.metric = metric;
        this.granularity = granularity;
    }

    // Getters & Setters
    public String getMetric() { return metric; }
    public void setMetric(String metric) { this.metric = metric; }

    public String getGranularity() { return granularity; }
    public void setGranularity(String granularity) { this.granularity = granularity; }

    public List<String> getLabels() { return labels; }
    public void setLabels(List<String> labels) { this.labels = labels; }

    public List<Long> getValues() { return values; }
    public void setValues(List<Long> values) { this.values = values; }

    public Map<String, Long> getBreakdown() { return breakdown; }
    public void setBreakdown(Map<String, Long> breakdown) { this.breakdown = breakdown; }

    public long getTotalValue() { return totalValue; }
    public void setTotalValue(long totalValue) { this.totalValue = totalValue; }

    public long getAverageValue() { return averageValue; }
    public void setAverageValue(long averageValue) { this.averageValue = averageValue; }

    public long getPeakValue() { return peakValue; }
    public void setPeakValue(long peakValue) { this.peakValue = peakValue; }

    public String getPeakDate() { return peakDate; }
    public void setPeakDate(String peakDate) { this.peakDate = peakDate; }
}
