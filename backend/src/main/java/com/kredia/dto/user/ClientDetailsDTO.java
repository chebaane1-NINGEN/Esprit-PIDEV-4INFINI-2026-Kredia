package com.kredia.dto.user;

import java.util.List;

/**
 * Detailed client data for agent view including activity history and eligibility.
 */
public class ClientDetailsDTO extends EnhancedClientDTO {

    private List<UserActivityResponseDTO> activities;
    private Integer riskScore;
    private String eligibility;

    public List<UserActivityResponseDTO> getActivities() {
        return activities;
    }

    public void setActivities(List<UserActivityResponseDTO> activities) {
        this.activities = activities;
    }

    public Integer getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Integer riskScore) {
        this.riskScore = riskScore;
    }

    public String getEligibility() {
        return eligibility;
    }

    public void setEligibility(String eligibility) {
        this.eligibility = eligibility;
    }
}
