package com.kredia.dashboard.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PublicStatsDTO {
    private long activeClients;
    private double approvalRate;
    private long processedCredits;
    private double averageDecisionDays;
}
