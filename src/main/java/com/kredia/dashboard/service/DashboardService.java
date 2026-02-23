package com.kredia.dashboard.service;

import com.kredia.dashboard.dto.AdminDashboardStatsDTO;
import com.kredia.dashboard.dto.ClientDashboardStatsDTO;
import com.kredia.dashboard.dto.EmployeeDashboardStatsDTO;
import com.kredia.dashboard.dto.PublicStatsDTO;
import com.kredia.entity.credit.Credit;
import com.kredia.enums.CreditStatus;
import com.kredia.enums.RiskLevel;
import com.kredia.repository.CreditRepository;
import com.kredia.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service layer for computing role-based dashboard statistics.
 * <p>
 * All methods return DTOs — no entities are ever exposed.
 * Division-by-zero is handled gracefully (returns 0.0).
 * Nullable aggregation results (SUM, AVG) default to 0.0.
 * </p>
 */
@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final CreditRepository creditRepository;
    private final UserRepository userRepository;

    public DashboardService(CreditRepository creditRepository, UserRepository userRepository) {
        this.creditRepository = creditRepository;
        this.userRepository = userRepository;
    }

    // ─── CLIENT DASHBOARD ─────────────────────────────────────────────

    /**
     * Build dashboard stats for a specific client.
     *
     * @param userId the authenticated client's user ID
     * @return ClientDashboardStatsDTO with personal loan metrics
     */
    public ClientDashboardStatsDTO getClientStats(Long userId) {
        long total = creditRepository.countByUserUserId(userId);
        long approved = creditRepository.countByUserUserIdAndStatus(userId, CreditStatus.APPROVED);
        long rejected = creditRepository.countByUserUserIdAndStatus(userId, CreditStatus.REJECTED);

        Double totalBorrowed = creditRepository.sumApprovedAmountByUser(userId, CreditStatus.APPROVED).orElse(0.0);
        Double avgAmount = creditRepository.avgAmountByUser(userId).orElse(0.0);
        Double approvalRate = safeDivide(approved, total) * 100;

        // Determine dominant risk level (most recent assignment)
        List<RiskLevel> riskLevels = creditRepository.findRiskLevelsByUser(userId);
        String riskLevel = riskLevels.isEmpty() ? "N/A" : riskLevels.get(0).name();

        return ClientDashboardStatsDTO.builder()
                .totalLoans(total)
                .approvedLoans(approved)
                .rejectedLoans(rejected)
                .totalBorrowedAmount(round(totalBorrowed))
                .averageLoanAmount(round(avgAmount))
                .approvalRate(round(approvalRate))
                .riskLevel(riskLevel)
                .build();
    }

    // ─── EMPLOYEE DASHBOARD ───────────────────────────────────────────

    /**
     * Build dashboard stats for a specific employee (Agent/Auditor).
     *
     * @param employeeId the authenticated employee's user ID
     * @return EmployeeDashboardStatsDTO with handled credit metrics
     */
    public EmployeeDashboardStatsDTO getEmployeeStats(Long employeeId) {
        long totalHandled = creditRepository.countByHandledBy(employeeId);
        long approved = creditRepository.countByHandledByAndStatus(employeeId, CreditStatus.APPROVED);
        long rejected = creditRepository.countByHandledByAndStatus(employeeId, CreditStatus.REJECTED);

        long lowRisk = creditRepository.countByHandledByAndRiskLevel(employeeId, RiskLevel.LOW);
        long mediumRisk = creditRepository.countByHandledByAndRiskLevel(employeeId, RiskLevel.MEDIUM);
        long highRisk = creditRepository.countByHandledByAndRiskLevel(employeeId, RiskLevel.HIGH)
                + creditRepository.countByHandledByAndRiskLevel(employeeId, RiskLevel.VERY_HIGH);

        // Compute average decision time in days
        Double avgDecisionDays = computeAverageDecisionTime(employeeId);

        return EmployeeDashboardStatsDTO.builder()
                .totalHandledCredits(totalHandled)
                .approvedCredits(approved)
                .rejectedCredits(rejected)
                .averageDecisionTimeDays(round(avgDecisionDays))
                .lowRiskCredits(lowRisk)
                .mediumRiskCredits(mediumRisk)
                .highRiskCredits(highRisk)
                .build();
    }

    // ─── ADMIN DASHBOARD ──────────────────────────────────────────────

    /**
     * Build platform-wide dashboard stats for admins with 100% mathematical
     * accuracy.
     * 
     * @return AdminDashboardStatsDTO with real database-driven financial analytics
     */
    public AdminDashboardStatsDTO getAdminStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyDaysAgo = now.minusDays(30);

        // 1. Core Financial KPIs
        long totalLoans = creditRepository.countTotalLoans();
        long approvedLoans = creditRepository.countApprovedLoans();
        long rejectedLoans = creditRepository.countRejectedLoans();
        long pendingLoans = creditRepository.countByStatus(CreditStatus.PENDING);
        long totalUsers = userRepository.count();

        Double totalBorrowedAmount = creditRepository.sumApprovedLoans().orElse(0.0);
        Double averageLoanAmount = creditRepository.averageLoanAmount().orElse(0.0);
        Double approvalRate = safeDivide(approvedLoans, totalLoans) * 100;

        // 2. Monthly Growth Calculation
        LocalDateTime currentMonthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime prevMonthStart = currentMonthStart.minusMonths(1);
        LocalDateTime prevMonthEnd = currentMonthStart.minusNanos(1);

        Double currentMonthVolume = creditRepository.sumApprovedVolumeInPeriod(currentMonthStart, now).orElse(0.0);
        Double prevMonthVolume = creditRepository.sumApprovedVolumeInPeriod(prevMonthStart, prevMonthEnd).orElse(0.0);

        Double growth = prevMonthVolume == 0 ? (currentMonthVolume > 0 ? 100.0 : 0.0)
                : ((currentMonthVolume - prevMonthVolume) / prevMonthVolume) * 100;

        // 3. Risk Distribution
        long lowRiskCount = creditRepository.countByRiskLevel(RiskLevel.LOW);
        long mediumRiskCount = creditRepository.countByRiskLevel(RiskLevel.MEDIUM);
        long highRiskCount = creditRepository.countByRiskLevel(RiskLevel.HIGH)
                + creditRepository.countByRiskLevel(RiskLevel.VERY_HIGH);

        // 4. Time-Series Data
        List<AdminDashboardStatsDTO.ChartPoint> loanVolumeTrend = mapTimeSeries(
                creditRepository.getVolumeTimeSeries(thirtyDaysAgo));
        List<AdminDashboardStatsDTO.ChartPoint> userGrowthTrend = mapCumulativeTimeSeries(
                userRepository.getUserGrowthTimeSeries(thirtyDaysAgo));
        List<AdminDashboardStatsDTO.ChartPoint> approvalRateTrend = mapApprovalTrend(
                creditRepository.getApprovalRateTimeSeries(thirtyDaysAgo));

        return AdminDashboardStatsDTO.builder()
                .totalLoans(totalLoans)
                .approvedLoans(approvedLoans)
                .rejectedLoans(rejectedLoans)
                .pendingLoans(pendingLoans)
                .totalUsers(totalUsers)
                .totalBorrowedAmount(round(totalBorrowedAmount))
                .averageLoanAmount(round(averageLoanAmount))
                .approvalRate(round(approvalRate))
                .monthlyGrowth(round(growth))
                .lowRiskUsers(lowRiskCount)
                .mediumRiskUsers(mediumRiskCount)
                .highRiskUsers(highRiskCount)
                .loanVolumeTrend(loanVolumeTrend)
                .userGrowthTrend(userGrowthTrend)
                .approvalRateTrend(approvalRateTrend)
                .build();
    }

    /**
     * Build public stats for the landing page.
     * No sensitive data exposed.
     * 
     * @return PublicStatsDTO
     */
    public PublicStatsDTO getPublicStats() {
        long totalLoans = creditRepository.countTotalLoans();
        long approvedLoans = creditRepository.countApprovedLoans();
        long totalUsers = userRepository.count();

        Double approvalRate = safeDivide(approvedLoans, totalLoans) * 100;
        Double avgDecisionHours = creditRepository.avgDecisionTimeInHours().orElse(0.0);
        Double avgDecisionDays = avgDecisionHours / 24.0;

        return PublicStatsDTO.builder()
                .activeClients(totalUsers)
                .approvalRate(round(approvalRate))
                .processedCredits(totalLoans)
                .averageDecisionDays(round(avgDecisionDays))
                .build();
    }

    private List<AdminDashboardStatsDTO.ChartPoint> mapTimeSeries(List<Object[]> results) {
        List<AdminDashboardStatsDTO.ChartPoint> points = new ArrayList<>();
        for (Object[] row : results) {
            String label = row[0].toString();
            Double value = ((Number) row[1]).doubleValue();
            points.add(new AdminDashboardStatsDTO.ChartPoint(label, value));
        }
        return points;
    }

    private List<AdminDashboardStatsDTO.ChartPoint> mapCumulativeTimeSeries(List<Object[]> results) {
        List<AdminDashboardStatsDTO.ChartPoint> points = new ArrayList<>();
        double runningTotal = 0;
        for (Object[] row : results) {
            String label = row[0].toString();
            runningTotal += ((Number) row[1]).doubleValue();
            points.add(new AdminDashboardStatsDTO.ChartPoint(label, runningTotal));
        }
        return points;
    }

    private List<AdminDashboardStatsDTO.ChartPoint> mapApprovalTrend(List<Object[]> results) {
        List<AdminDashboardStatsDTO.ChartPoint> points = new ArrayList<>();
        for (Object[] row : results) {
            String label = row[0].toString();
            double approved = ((Number) row[1]).doubleValue();
            double total = ((Number) row[2]).doubleValue();
            double rate = safeDivide(approved, total) * 100;
            points.add(new AdminDashboardStatsDTO.ChartPoint(label, round(rate)));
        }
        return points;
    }

    // ─── HELPER METHODS ───────────────────────────────────────────────

    /**
     * Compute average decision time in days for credits handled by an employee.
     * Only credits with both createdAt and decisionDate are included.
     *
     * @param employeeId the employee user ID
     * @return average days, or 0.0 if no data
     */
    private Double computeAverageDecisionTime(Long employeeId) {
        List<Credit> credits = creditRepository.findByHandledBy(employeeId);

        double totalDays = 0;
        int count = 0;

        for (Credit c : credits) {
            if (c.getCreatedAt() != null && c.getDecisionDate() != null) {
                long seconds = Duration.between(c.getCreatedAt(), c.getDecisionDate()).getSeconds();
                totalDays += seconds / 86400.0; // Convert to days
                count++;
            }
        }

        return count == 0 ? 0.0 : totalDays / count;
    }

    /**
     * Safe division: returns 0.0 if denominator is zero.
     */
    private double safeDivide(double numerator, double denominator) {
        return denominator == 0 ? 0.0 : numerator / denominator;
    }

    /**
     * Round a double value to 2 decimal places.
     */
    private Double round(Double value) {
        if (value == null)
            return 0.0;
        return Math.round(value * 100.0) / 100.0;
    }
}
