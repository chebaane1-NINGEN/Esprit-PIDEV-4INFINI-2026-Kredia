package com.kredia.dto.analytics;

import java.util.List;
import java.util.Map;

/**
 * DrillDownDataDTO: Les données brutes derrière chaque KPI
 * - metric: nom du KPI
 * - calculatedValue: la valeur finale
 * - rawVariables: les variables utilisées pour le calcul
 * - detailedData: liste des enregistrements bruts (ex: UserActivity, User, etc)
 * - filters: les filtres appliqués
 */
public class DrillDownDataDTO {
    private String metric;
    private String period; // Ex: "2026-04-20 à 2026-04-26"
    private Object calculatedValue;
    private Map<String, Object> rawVariables; // Ex: {numerator: 150, denominator: 1000, ...}
    private List<Map<String, Object>> detailedData; // Enregistrements individuels
    private int totalRecords;
    private Map<String, String> appliedFilters;
    private String calculationFormula; // Ex: "(new_users / total_users) * 100"
    private String lastCalculatedAt;

    public DrillDownDataDTO() {}

    public DrillDownDataDTO(String metric) {
        this.metric = metric;
    }

    // Getters & Setters
    public String getMetric() { return metric; }
    public void setMetric(String metric) { this.metric = metric; }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public Object getCalculatedValue() { return calculatedValue; }
    public void setCalculatedValue(Object calculatedValue) { this.calculatedValue = calculatedValue; }

    public Map<String, Object> getRawVariables() { return rawVariables; }
    public void setRawVariables(Map<String, Object> rawVariables) { this.rawVariables = rawVariables; }

    public List<Map<String, Object>> getDetailedData() { return detailedData; }
    public void setDetailedData(List<Map<String, Object>> detailedData) { this.detailedData = detailedData; }

    public int getTotalRecords() { return totalRecords; }
    public void setTotalRecords(int totalRecords) { this.totalRecords = totalRecords; }

    public Map<String, String> getAppliedFilters() { return appliedFilters; }
    public void setAppliedFilters(Map<String, String> appliedFilters) { this.appliedFilters = appliedFilters; }

    public String getCalculationFormula() { return calculationFormula; }
    public void setCalculationFormula(String calculationFormula) { this.calculationFormula = calculationFormula; }

    public String getLastCalculatedAt() { return lastCalculatedAt; }
    public void setLastCalculatedAt(String lastCalculatedAt) { this.lastCalculatedAt = lastCalculatedAt; }
}
