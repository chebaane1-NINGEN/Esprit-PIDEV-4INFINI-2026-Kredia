package com.kredia.service.analytics.impl;

import com.kredia.dto.analytics.*;
import com.kredia.entity.user.User;
import com.kredia.entity.user.UserActivity;
import com.kredia.entity.user.UserActivityActionType;
import com.kredia.entity.user.UserRole;
import com.kredia.repository.user.UserActivityRepository;
import com.kredia.repository.user.UserRepository;
import com.kredia.service.analytics.AnalyticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AnalyticsServiceImpl: Implémentation du KPI Engine en temps réel
 * 
 * Architecture:
 * 1. Helper methods pour calculs de base (comptages, agrégations)
 * 2. KPI Calculations: Grace Rate, Activity Rate, System Load, Success Rate
 * 3. Time-Series Aggregation: Par jour, semaine, mois
 * 4. Drill-down à données brutes
 * 5. Agent Performance Scoring avec formule pondérée
 * 6. Comparaisons périodiques et rangement
 */
@Service
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {
    private static final Logger logger = LoggerFactory.getLogger(AnalyticsServiceImpl.class);

    private final UserRepository userRepository;
    private final UserActivityRepository userActivityRepository;

    public AnalyticsServiceImpl(UserRepository userRepository, UserActivityRepository userActivityRepository) {
        this.userRepository = userRepository;
        this.userActivityRepository = userActivityRepository;
    }

    // ==================== DASHBOARD PRINCIPAL ====================

    @Override
    public EnhancedAnalyticsDashboardDTO getEnhancedAnalyticsDashboard(Long actorId, int days) {
        Instant endDate = Instant.now();
        Instant startDate = endDate.minus(days, ChronoUnit.DAYS);

        EnhancedAnalyticsDashboardDTO dashboard = new EnhancedAnalyticsDashboardDTO();
        dashboard.setPeriod("Derniers " + days + " jours");

        // === KPIs Principales ===
        dashboard.setGrowthRate(calculateGrowthRate(actorId, startDate, endDate));
        dashboard.setActivityRate(calculateActivityRate(actorId, startDate, endDate));
        dashboard.setSystemLoad(calculateSystemLoad(actorId));
        dashboard.setSuccessRate(calculateSuccessRate(actorId, startDate, endDate));

        // === Statistiques Globales ===
        dashboard.setTotalUsers(userRepository.countByDeletedFalse());
        dashboard.setTotalClients(userRepository.countByRoleAndDeletedFalse(UserRole.CLIENT));
        dashboard.setTotalAgents(userRepository.countByRoleAndDeletedFalse(UserRole.AGENT));
        dashboard.setActiveUsers(countActiveUsers());
        dashboard.setBlockedUsers(countBlockedUsers());
        dashboard.setSuspendedUsers(countSuspendedUsers());

        // === Activité ===
        List<UserActivity> activities = userActivityRepository.findByTimestampBetween(startDate, endDate);
        dashboard.setTotalActions((long) activities.size());
        dashboard.setApprovalCount(activities.stream()
                .filter(a -> a.getActionType() == UserActivityActionType.APPROVAL).count());
        dashboard.setRejectionCount(activities.stream()
                .filter(a -> a.getActionType() == UserActivityActionType.REJECTION).count());

        // === Données Temporelles ===
        dashboard.setUserGrowthTimeSeries(getUserGrowthTimeSeries(actorId, "WEEK", startDate, endDate));
        dashboard.setActivityTimeSeries(getActivityTimeSeries(actorId, "WEEK", startDate, endDate));
        dashboard.setSuccessRateTimeSeries(getSuccessRateTimeSeries(actorId, "WEEK", startDate, endDate));

        // === Santé Système ===
        dashboard.setSystemHealthScore(calculateSystemHealthScore());
        dashboard.setSystemHealthStatus(getHealthStatus(calculateSystemHealthScore()));

        // === Distributions ===
        dashboard.setUserRoleDistribution(getUserRoleDistribution());
        dashboard.setUserStatusDistribution(getUserStatusDistribution());
        dashboard.setActionTypeDistribution(getActionTypeDistribution(activities));

        return dashboard;
    }

    // ==================== KPIs PRINCIPALES ====================

    @Override
    public KpiMetricDTO calculateGrowthRate(Long actorId, Instant startDate, Instant endDate) {
        long totalUsers = userRepository.countByDeletedFalse();
        long newUsers = userRepository.countByCreatedAtBetweenAndDeletedFalse(startDate, endDate);

        double growthRate = totalUsers > 0 ? (newUsers / (double) totalUsers) * 100 : 0;

        // Trend comparison avec la période précédente
        Instant prevStart = startDate.minus(ChronoUnit.DAYS.between(startDate, endDate), ChronoUnit.DAYS);
        Instant prevEnd = startDate;
        long prevNewUsers = userRepository.countByCreatedAtBetweenAndDeletedFalse(prevStart, prevEnd);
        double prevGrowthRate = totalUsers > 0 ? (prevNewUsers / (double) totalUsers) * 100 : 0;
        double trend = growthRate - prevGrowthRate;

        KpiMetricDTO kpi = new KpiMetricDTO("growth_rate", "Taux de Croissance", 
                String.format("%.2f%%", growthRate), "%");
        kpi.setTrend(trend);
        kpi.setTrendDirection(trend > 0 ? KpiMetricDTO.TrendDirection.UP : 
                             trend < 0 ? KpiMetricDTO.TrendDirection.DOWN : 
                             KpiMetricDTO.TrendDirection.STABLE);
        kpi.setDescription(newUsers + " nouveaux utilisateurs sur " + totalUsers + " total");
        return kpi;
    }

    @Override
    public KpiMetricDTO calculateActivityRate(Long actorId, Instant startDate, Instant endDate) {
        try {
            List<UserActivity> activities = userActivityRepository.findByTimestampBetween(startDate, endDate);
            long days = ChronoUnit.DAYS.between(startDate, endDate);
            if (days <= 0) days = 1; // HOTFIX: prevent division by zero
            double activityRate = activities.size() / (double) days;
            logger.debug("ActivityRate: {} activities over {} days = {} per day", activities.size(), days, activityRate);

            // Trend
            Instant prevStart = startDate.minus(days, ChronoUnit.DAYS);
            Instant prevEnd = startDate;
            List<UserActivity> prevActivities = userActivityRepository.findByTimestampBetween(prevStart, prevEnd);
            double prevActivityRate = prevActivities.size() / (double) days;
            double trend = activityRate - prevActivityRate;

            KpiMetricDTO kpi = new KpiMetricDTO("activity_rate", "Taux d'Activité", 
                    String.format("%.2f", activityRate), "actions/jour");
            kpi.setTrend(trend);
            kpi.setTrendDirection(trend > 0 ? KpiMetricDTO.TrendDirection.UP : 
                                 trend < 0 ? KpiMetricDTO.TrendDirection.DOWN : 
                                 KpiMetricDTO.TrendDirection.STABLE);
            return kpi;
        } catch (Exception e) {
            logger.error("Error calculating activity rate", e);
            KpiMetricDTO fallback = new KpiMetricDTO("activity_rate", "Taux d'Activité", "0.00", "actions/jour");
            fallback.setTrendDirection(KpiMetricDTO.TrendDirection.STABLE);
            return fallback;
        }
    }

    @Override
    public KpiMetricDTO calculateSystemLoad(Long actorId) {
        long totalActivities = userActivityRepository.count();
        long recentActivities = userActivityRepository.countByTimestampAfter(Instant.now().minus(1, ChronoUnit.HOURS));
        double systemLoad = (recentActivities / (double) Math.max(1, totalActivities)) * 100;

        KpiMetricDTO kpi = new KpiMetricDTO("system_load", "Charge Système", 
                String.format("%.2f%%", systemLoad), "%");
        kpi.setTrendDirection(systemLoad < 50 ? KpiMetricDTO.TrendDirection.DOWN :
                             systemLoad < 80 ? KpiMetricDTO.TrendDirection.STABLE :
                             KpiMetricDTO.TrendDirection.UP);
        return kpi;
    }

    @Override
    public KpiMetricDTO calculateSuccessRate(Long actorId, Instant startDate, Instant endDate) {
        List<UserActivity> activities = userActivityRepository.findByTimestampBetween(startDate, endDate);
        long approvals = activities.stream()
                .filter(a -> a.getActionType() == UserActivityActionType.APPROVAL).count();
        long totalAttempts = activities.size();

        double successRate = totalAttempts > 0 ? (approvals / (double) totalAttempts) * 100 : 0;

        // Trend
        Instant prevStart = startDate.minus(ChronoUnit.DAYS.between(startDate, endDate), ChronoUnit.DAYS);
        Instant prevEnd = startDate;
        List<UserActivity> prevActivities = userActivityRepository.findByTimestampBetween(prevStart, prevEnd);
        long prevApprovals = prevActivities.stream()
                .filter(a -> a.getActionType() == UserActivityActionType.APPROVAL).count();
        double prevSuccessRate = prevActivities.size() > 0 ? (prevApprovals / (double) prevActivities.size()) * 100 : 0;
        double trend = successRate - prevSuccessRate;

        KpiMetricDTO kpi = new KpiMetricDTO("success_rate", "Taux de Succès", 
                String.format("%.2f%%", successRate), "%");
        kpi.setTrend(trend);
        kpi.setTrendDirection(trend > 0 ? KpiMetricDTO.TrendDirection.UP : 
                             trend < 0 ? KpiMetricDTO.TrendDirection.DOWN : 
                             KpiMetricDTO.TrendDirection.STABLE);
        kpi.setDescription(approvals + " approbations sur " + totalAttempts + " tentatives");
        return kpi;
    }

    // ==================== DONNÉES TEMPORELLES ====================

    @Override
    public TimeSeriesDataDTO getUserGrowthTimeSeries(Long actorId, String granularity, Instant startDate, Instant endDate) {
        TimeSeriesDataDTO timeSeries = new TimeSeriesDataDTO("user_growth", granularity);
        List<String> labels = new ArrayList<>();
        List<Long> values = new ArrayList<>();

        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        Instant current = startDate;

        while (!current.isAfter(endDate)) {
            Instant periodEnd = current.plus(1, ChronoUnit.DAYS);
            long newUsersInPeriod = userRepository.countByCreatedAtBetweenAndDeletedFalse(current, periodEnd);

            labels.add(current.toString().substring(0, 10));
            values.add(newUsersInPeriod);

            current = periodEnd;
        }

        timeSeries.setLabels(labels);
        timeSeries.setValues(values);
        timeSeries.setTotalValue(values.stream().mapToLong(Long::longValue).sum());
        timeSeries.setAverageValue(timeSeries.getTotalValue() / Math.max(1, values.size()));

        // Role breakdown
        Map<String, Long> breakdown = new HashMap<>();
        breakdown.put("CLIENTS", userRepository.countByRoleAndDeletedFalse(UserRole.CLIENT));
        breakdown.put("AGENTS", userRepository.countByRoleAndDeletedFalse(UserRole.AGENT));
        timeSeries.setBreakdown(breakdown);

        return timeSeries;
    }

    @Override
    public TimeSeriesDataDTO getActivityTimeSeries(Long actorId, String granularity, Instant startDate, Instant endDate) {
        TimeSeriesDataDTO timeSeries = new TimeSeriesDataDTO("activity", granularity);
        List<String> labels = new ArrayList<>();
        List<Long> values = new ArrayList<>();

        Instant current = startDate;
        while (!current.isAfter(endDate)) {
            Instant periodEnd = current.plus(1, ChronoUnit.DAYS);
            long activitiesInPeriod = userActivityRepository.countByTimestampBetween(current, periodEnd);

            labels.add(current.toString().substring(0, 10));
            values.add(activitiesInPeriod);

            current = periodEnd;
        }

        timeSeries.setLabels(labels);
        timeSeries.setValues(values);
        timeSeries.setTotalValue(values.stream().mapToLong(Long::longValue).sum());
        timeSeries.setAverageValue(timeSeries.getTotalValue() / Math.max(1, values.size()));

        // Action type breakdown
        List<UserActivity> allActivityies = userActivityRepository.findByTimestampBetween(startDate, endDate);
        Map<String, Long> breakdown = allActivityies.stream()
                .collect(Collectors.groupingBy(a -> a.getActionType().toString(), Collectors.counting()));
        timeSeries.setBreakdown(breakdown);

        return timeSeries;
    }

    @Override
    public TimeSeriesDataDTO getSuccessRateTimeSeries(Long actorId, String granularity, Instant startDate, Instant endDate) {
        TimeSeriesDataDTO timeSeries = new TimeSeriesDataDTO("success_rate", granularity);
        List<String> labels = new ArrayList<>();
        List<Long> values = new ArrayList<>();

        Instant current = startDate;
        while (!current.isAfter(endDate)) {
            Instant periodEnd = current.plus(1, ChronoUnit.DAYS);
            List<UserActivity> periodActivities = userActivityRepository.findByTimestampBetween(current, periodEnd);
            long approvals = periodActivities.stream()
                    .filter(a -> a.getActionType() == UserActivityActionType.APPROVAL).count();

            labels.add(current.toString().substring(0, 10));
            values.add(periodActivities.size() > 0 ? Math.round((approvals / (double) periodActivities.size()) * 100) : 0);

            current = periodEnd;
        }

        timeSeries.setLabels(labels);
        timeSeries.setValues(values);
        timeSeries.setTotalValue(values.stream().mapToLong(Long::longValue).sum());
        timeSeries.setAverageValue(timeSeries.getTotalValue() / Math.max(1, values.size()));

        return timeSeries;
    }

    // ==================== DRILL-DOWN DONNÉES BRUTES ====================

    @Override
    public DrillDownDataDTO drillDownGrowthRate(Long actorId, Instant startDate, Instant endDate) {
        DrillDownDataDTO drillDown = new DrillDownDataDTO("growth_rate");
        drillDown.setPeriod(startDate.toString() + " à " + endDate.toString());
        drillDown.setCalculationFormula("(new_users / total_users) * 100");

        long totalUsers = userRepository.countByDeletedFalse();
        long newUsers = userRepository.countByCreatedAtBetweenAndDeletedFalse(startDate, endDate);

        Map<String, Object> rawVariables = new HashMap<>();
        rawVariables.put("new_users", newUsers);
        rawVariables.put("total_users", totalUsers);
        rawVariables.put("growth_rate_percent", totalUsers > 0 ? (newUsers / (double) totalUsers) * 100 : 0);
        drillDown.setRawVariables(rawVariables);

        Object calculatedValue = totalUsers > 0 ? (newUsers / (double) totalUsers) * 100 : 0;
        drillDown.setCalculatedValue(calculatedValue);

        // Récupérer les nouveaux utilisateurs
        List<User> newUsersList = userRepository.findByCreatedAtBetweenAndDeletedFalse(startDate, endDate);
        List<Map<String, Object>> detailedData = newUsersList.stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("userId", user.getId());
            map.put("email", user.getEmail());
            map.put("firstName", user.getFirstName());
            map.put("lastName", user.getLastName());
            map.put("role", user.getRole());
            map.put("createdAt", user.getCreatedAt());
            return map;
        }).collect(Collectors.toList());

        drillDown.setDetailedData(detailedData);
        drillDown.setTotalRecords(detailedData.size());
        drillDown.setLastCalculatedAt(Instant.now().toString());

        return drillDown;
    }

    @Override
    public DrillDownDataDTO drillDownActivityRate(Long actorId, Instant startDate, Instant endDate) {
        DrillDownDataDTO drillDown = new DrillDownDataDTO("activity_rate");
        drillDown.setPeriod(startDate.toString() + " à " + endDate.toString());

        List<UserActivity> activities = userActivityRepository.findByTimestampBetween(startDate, endDate);
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;

        Map<String, Object> rawVariables = new HashMap<>();
        rawVariables.put("total_activities", (long) activities.size());
        rawVariables.put("days_in_period", days);
        rawVariables.put("activity_rate", days > 0 ? activities.size() / (double) days : 0);
        drillDown.setRawVariables(rawVariables);

        List<Map<String, Object>> detailedData = activities.stream().map(activity -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", activity.getId());
            map.put("userId", activity.getUserId());
            map.put("actionType", activity.getActionType());
            map.put("description", activity.getDescription());
            map.put("timestamp", activity.getTimestamp());
            return map;
        }).collect(Collectors.toList());

        drillDown.setDetailedData(detailedData);
        drillDown.setTotalRecords(activities.size());
        drillDown.setCalculatedValue(days > 0 ? activities.size() / (double) days : 0);
        drillDown.setLastCalculatedAt(Instant.now().toString());

        return drillDown;
    }

    @Override
    public DrillDownDataDTO drillDownSystemLoad(Long actorId) {
        DrillDownDataDTO drillDown = new DrillDownDataDTO("system_load");
        drillDown.setPeriod("Instantané (maintenant)");

        long recentActivities = userActivityRepository.countByTimestampAfter(Instant.now().minus(1, ChronoUnit.HOURS));
        long totalActivities = userActivityRepository.count();

        Map<String, Object> rawVariables = new HashMap<>();
        rawVariables.put("recent_activities_1h", recentActivities);
        rawVariables.put("total_activities_all_time", totalActivities);
        drillDown.setRawVariables(rawVariables);
        logger.debug("SystemLoad: {} recent / {} total", recentActivities, totalActivities);

        List<UserActivity> recentActs = userActivityRepository.findByTimestampAfterOrderByTimestampDesc(
                Instant.now().minus(1, ChronoUnit.HOURS));
        // Limit to 100 most recent (FIXED: removed duplicate limits)
        recentActs = recentActs.stream().limit(100).collect(java.util.stream.Collectors.toList());

        List<Map<String, Object>> detailedData = recentActs.stream().map(activity -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", activity.getId());
            map.put("userId", activity.getUserId());
            map.put("actionType", activity.getActionType());
            map.put("timestamp", activity.getTimestamp());
            return map;
        }).collect(Collectors.toList());

        drillDown.setDetailedData(detailedData);
        drillDown.setTotalRecords(detailedData.size());
        drillDown.setCalculatedValue((recentActivities / (double) Math.max(1, totalActivities)) * 100);
        drillDown.setLastCalculatedAt(Instant.now().toString());

        return drillDown;
    }

    @Override
    public DrillDownDataDTO drillDownSuccessRate(Long actorId, Instant startDate, Instant endDate) {
        DrillDownDataDTO drillDown = new DrillDownDataDTO("success_rate");
        drillDown.setPeriod(startDate.toString() + " à " + endDate.toString());
        drillDown.setCalculationFormula("(approvals / total_attempts) * 100");

        List<UserActivity> activities = userActivityRepository.findByTimestampBetween(startDate, endDate);
        long approvals = activities.stream()
                .filter(a -> a.getActionType() == UserActivityActionType.APPROVAL).count();

        Map<String, Object> rawVariables = new HashMap<>();
        rawVariables.put("approvals", approvals);
        rawVariables.put("total_attempts", (long) activities.size());
        rawVariables.put("success_rate_percent", activities.size() > 0 ? (approvals / (double) activities.size()) * 100 : 0);
        drillDown.setRawVariables(rawVariables);

        List<Map<String, Object>> detailedData = activities.stream().map(activity -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", activity.getId());
            map.put("userId", activity.getUserId());
            map.put("actionType", activity.getActionType());
            map.put("description", activity.getDescription());
            map.put("timestamp", activity.getTimestamp());
            map.put("success", activity.getActionType() == UserActivityActionType.APPROVAL);
            return map;
        }).collect(Collectors.toList());

        drillDown.setDetailedData(detailedData);
        drillDown.setTotalRecords(activities.size());
        drillDown.setCalculatedValue(activities.size() > 0 ? (approvals / (double) activities.size()) * 100 : 0);
        drillDown.setLastCalculatedAt(Instant.now().toString());

        return drillDown;
    }

    // ==================== AGENT PERFORMANCE ====================

    @Override
    public AgentPerformanceScoreDTO calculateAgentPerformanceScore(Long actorId, Long agentId, int days) {
        Instant endDate = Instant.now();
        Instant startDate = endDate.minus(days, ChronoUnit.DAYS);

        List<User> allAgents = userRepository.findAllByRoleAndDeletedFalse(UserRole.AGENT);
        List<AgentPerformanceScoreDTO> teamScores = buildAgentPerformanceRanking(allAgents, startDate, endDate);

        return teamScores.stream()
                .filter(score -> score.getAgentId() == agentId)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Agent not found"));
    }

    @Override
    public AgentPerformanceScoreDTO getAgent360View(Long actorId, Long agentId) {
        Instant endDate = Instant.now();
        Instant startDate = endDate.minus(90, ChronoUnit.DAYS);
        List<User> allAgents = userRepository.findAllByRoleAndDeletedFalse(UserRole.AGENT);
        List<AgentPerformanceScoreDTO> teamScores = buildAgentPerformanceRanking(allAgents, startDate, endDate);

        return teamScores.stream()
                .filter(score -> score.getAgentId() == agentId)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Agent not found"));
    }

    @Override
    public List<AgentPerformanceScoreDTO> getAgentPerformanceRanking(Long actorId, int limit) {
        List<User> allAgents = userRepository.findAllByRoleAndDeletedFalse(UserRole.AGENT);
        return buildAgentPerformanceRanking(allAgents, Instant.now().minus(30, ChronoUnit.DAYS), Instant.now())
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<AgentPerformanceScoreDTO> buildAgentPerformanceRanking(List<User> agents, Instant startDate, Instant endDate) {
        List<AgentPerformanceScoreDTO> scores = agents.stream()
                .map(agent -> buildBaseAgentPerformanceScore(agent, startDate, endDate))
                .collect(Collectors.toList());

        double teamAvgSuccessRate = scores.stream()
                .mapToDouble(AgentPerformanceScoreDTO::getSuccessRate)
                .average().orElse(0);

        double teamAvgVolume = scores.stream()
                .mapToDouble(AgentPerformanceScoreDTO::getTotalActions)
                .average().orElse(0);

        double teamAvgProcessingTime = scores.stream()
                .mapToDouble(AgentPerformanceScoreDTO::getAverageProcessingTimeSeconds)
                .average().orElse(0);

        for (AgentPerformanceScoreDTO score : scores) {
            score.setTeamAverageSuccessRate(teamAvgSuccessRate);
            score.setTeamAverageVolume(teamAvgVolume);
            score.setTeamAverageProcessingTime(teamAvgProcessingTime);
            score.setTeamSize(scores.size());

            double speedScore = calculateSpeedScore(score.getAverageProcessingTimeSeconds(), teamAvgProcessingTime);
            score.setSpeedScore(speedScore);

            double volumeScore = calculateVolumeScore(score.getTotalActions(), teamAvgVolume);
            score.setVolumeScore(volumeScore);

            double finalScore = (score.getSuccessRate() * 0.6)
                    + (volumeScore * 0.3)
                    + (speedScore * 0.1);
            score.setFinalPerformanceScore(finalScore);
            score.setPerformanceRank(getPerformanceRank(finalScore));
        }

        scores.sort(Comparator.comparingDouble(AgentPerformanceScoreDTO::getFinalPerformanceScore).reversed());
        for (int i = 0; i < scores.size(); i++) {
            scores.get(i).setPositionInTeam(String.format("%d/%d", i + 1, scores.size()));
        }

        return scores;
    }

    private AgentPerformanceScoreDTO buildBaseAgentPerformanceScore(User agent, Instant startDate, Instant endDate) {
        AgentPerformanceScoreDTO score = new AgentPerformanceScoreDTO();
        score.setAgentId(agent.getId());
        score.setAgentName(agent.getFirstName() + " " + agent.getLastName());
        score.setAgentEmail(agent.getEmail());
        score.setAgentRole(agent.getRole().toString());

        List<UserActivity> agentActivities = userActivityRepository.findByUserIdAndTimestampBetween(agent.getId(), startDate, endDate);
        long approvals = agentActivities.stream()
                .filter(a -> a.getActionType() == UserActivityActionType.APPROVAL).count();
        long rejections = agentActivities.stream()
                .filter(a -> a.getActionType() == UserActivityActionType.REJECTION).count();
        long totalActions = agentActivities.size();

        score.setTotalActions(totalActions);
        score.setApprovalCount(approvals);
        score.setRejectionCount(rejections);
        score.setSuccessRate(totalActions > 0 ? (approvals / (double) totalActions) * 100 : 0);
        score.setNumberOfClientsHandled(agentActivities.stream()
                .filter(a -> a.getActionType() == UserActivityActionType.CLIENT_HANDLED)
                .map(UserActivity::getUserId)
                .distinct()
                .count());

        double avgProcessingTime = calculateAverageProcessingTimeSeconds(agentActivities);
        score.setAverageProcessingTimeSeconds(avgProcessingTime);

        Map<String, Long> actionTypeBreakdown = agentActivities.stream()
                .collect(Collectors.groupingBy(a -> a.getActionType().toString(), Collectors.counting()));
        score.setActionTypeBreakdown(actionTypeBreakdown);

        score.setActivityTimeSeries(getAgentActivityTimeSeries(agent.getId(), "WEEK", startDate, endDate));
        score.setSuccessRateTimeSeries(getAgentSuccessRateTimeSeries(agent.getId(), "WEEK", startDate, endDate));
        score.setProcessingTimeTimeSeries(getAgentProcessingTimeTimeSeries(agent.getId(), "WEEK", startDate, endDate));

        List<Map<String, Object>> recentActivities = agentActivities.stream()
                .sorted(Comparator.comparing(UserActivity::getTimestamp).reversed())
                .limit(10)
                .map(activity -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("actionType", activity.getActionType());
                    map.put("description", activity.getDescription());
                    map.put("timestamp", activity.getTimestamp());
                    return map;
                }).collect(Collectors.toList());
        score.setRecentActivities(recentActivities);

        agentActivities.stream()
                .max(Comparator.comparing(UserActivity::getTimestamp))
                .ifPresent(latest -> {
                    score.setLastActivityTime(latest.getTimestamp().toEpochMilli());
                    score.setLastActivityDescription(latest.getDescription());
                });

        return score;
    }

    private double calculateAverageProcessingTimeSeconds(List<UserActivity> activities) {
        if (activities.isEmpty()) {
            return 0;
        }

        Instant earliest = activities.stream()
                .map(UserActivity::getTimestamp)
                .min(Instant::compareTo)
                .orElse(Instant.now());
        Instant latest = activities.stream()
                .map(UserActivity::getTimestamp)
                .max(Instant::compareTo)
                .orElse(Instant.now());

        double totalSeconds = Math.max(0, latest.toEpochMilli() - earliest.toEpochMilli()) / 1000.0;
        return totalSeconds > 0 ? totalSeconds / activities.size() : 0;
    }

    private TimeSeriesDataDTO getAgentProcessingTimeTimeSeries(Long agentId, String granularity, Instant startDate, Instant endDate) {
        TimeSeriesDataDTO timeSeries = new TimeSeriesDataDTO("processing_time", granularity);
        List<String> labels = new ArrayList<>();
        List<Long> values = new ArrayList<>();

        Instant current = startDate;
        while (!current.isAfter(endDate)) {
            Instant periodEnd = current.plus(1, ChronoUnit.DAYS);
            List<UserActivity> activities = userActivityRepository.findByUserIdAndTimestampBetween(agentId, current, periodEnd);
            double averageSeconds = calculateAverageProcessingTimeSeconds(activities);
            labels.add(current.toString().substring(0, 10));
            values.add(Math.round(averageSeconds));
            current = periodEnd;
        }

        timeSeries.setLabels(labels);
        timeSeries.setValues(values);
        timeSeries.setTotalValue(values.stream().mapToLong(Long::longValue).sum());
        timeSeries.setAverageValue(values.isEmpty() ? 0 : Math.round(values.stream().mapToLong(Long::longValue).sum() / (double) values.size()));
        if (!values.isEmpty()) {
            long peak = values.stream().mapToLong(Long::longValue).max().orElse(0);
            timeSeries.setPeakValue(peak);
            timeSeries.setPeakDate(labels.get(values.indexOf(peak)));
        }
        return timeSeries;
    }

    private double calculateSpeedScore(double averageProcessingTimeSeconds, double teamAverageProcessingTime) {
        if (averageProcessingTimeSeconds <= 0) {
            return teamAverageProcessingTime > 0 ? 100.0 : 50.0;
        }
        if (teamAverageProcessingTime <= 0) {
            return 50.0;
        }
        double score = (teamAverageProcessingTime / averageProcessingTimeSeconds) * 100.0;
        return Math.max(0, Math.min(100, score));
    }

    @Override
    public DrillDownDataDTO drillDownAgentPerformance(Long actorId, Long agentId) {
        DrillDownDataDTO drillDown = new DrillDownDataDTO("agent_performance");
        drillDown.setPeriod("Derniers 30 jours");

        Instant endDate = Instant.now();
        Instant startDate = endDate.minus(30, ChronoUnit.DAYS);

        List<UserActivity> activities = userActivityRepository.findByUserIdAndTimestampBetween(agentId, startDate, endDate);

        Map<String, Object> rawVariables = new HashMap<>();
        rawVariables.put("total_activities", (long) activities.size());
        rawVariables.put("approvals", activities.stream()
                .filter(a -> a.getActionType() == UserActivityActionType.APPROVAL).count());
        rawVariables.put("rejections", activities.stream()
                .filter(a -> a.getActionType() == UserActivityActionType.REJECTION).count());
        drillDown.setRawVariables(rawVariables);

        List<Map<String, Object>> detailedData = activities.stream().map(activity -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", activity.getId());
            map.put("actionType", activity.getActionType());
            map.put("description", activity.getDescription());
            map.put("timestamp", activity.getTimestamp());
            return map;
        }).collect(Collectors.toList());

        drillDown.setDetailedData(detailedData);
        drillDown.setTotalRecords(activities.size());
        drillDown.setLastCalculatedAt(Instant.now().toString());

        return drillDown;
    }

    // ==================== SANTÉ SYSTÈME ====================

    @Override
    public java.util.Map<String, Object> calculateSystemHealth(Long actorId) {
        Map<String, Object> health = new HashMap<>();

        double score = calculateSystemHealthScore();
        health.put("score", score);
        health.put("status", getHealthStatus(score));
        health.put("lastUpdated", Instant.now().toString());

        // Composants
        Map<String, Integer> components = new HashMap<>();
        components.put("database", 95);
        components.put("api", 98);
        components.put("cache", 100);
        health.put("components", components);

        return health;
    }

    @Override
    public java.util.Map<String, Double> comparePeriods(Long actorId, int days1, Optional<Integer> days2) {
        int period2Days = days2.orElse(days1 * 2);

        Instant now = Instant.now();
        Instant period1End = now;
        Instant period1Start = now.minus(days1, ChronoUnit.DAYS);
        Instant period2End = now.minus(days1, ChronoUnit.DAYS);
        Instant period2Start = period2End.minus(period2Days, ChronoUnit.DAYS);

        Map<String, Double> comparison = new HashMap<>();

        long users1 = userRepository.countByCreatedAtBetweenAndDeletedFalse(period1Start, period1End);
        long users2 = userRepository.countByCreatedAtBetweenAndDeletedFalse(period2Start, period2End);
        double userGrowth = users2 > 0 ? ((users1 - users2) / (double) users2) * 100 : 0;
        comparison.put("userGrowth", userGrowth);

        List<UserActivity> act1 = userActivityRepository.findByTimestampBetween(period1Start, period1End);
        List<UserActivity> act2 = userActivityRepository.findByTimestampBetween(period2Start, period2End);
        double activityGrowth = act2.size() > 0 ? ((act1.size() - act2.size()) / (double) act2.size()) * 100 : 0;
        comparison.put("activityGrowth", activityGrowth);

        return comparison;
    }

    // ==================== HELPERS ====================

    private long countActiveUsers() {
        // Supposer que les utilisateurs actifs sont ceux ayant une activité récente
        return userActivityRepository.countByTimestampAfter(Instant.now().minus(7, ChronoUnit.DAYS));
    }

    private long countBlockedUsers() {
        // Basé sur le statut ou les tentatives échouées
        return userRepository.findAll().stream()
                .filter(u -> u.getFailedLoginAttempts() >= 3).count();
    }

    private long countSuspendedUsers() {
        // À implémenter selon la logique métier
        return 0;
    }

    private double calculateSystemHealthScore() {
        try {
            // Fixed: Use a dummy adminId to avoid NPE, or better, use direct DB queries
            Long dummyAdminId = 1L;
            Instant now = Instant.now();
            Instant thirtyDaysAgo = now.minus(30, ChronoUnit.DAYS);
            
            KpiMetricDTO growthKpi = calculateGrowthRate(dummyAdminId, thirtyDaysAgo, now);
            KpiMetricDTO successKpi = calculateSuccessRate(dummyAdminId, thirtyDaysAgo, now);
            
            double userGrowth = 0, successRate = 0;
            if (growthKpi.getValue() instanceof String) {
                userGrowth = Double.parseDouble(((String) growthKpi.getValue()).replace("%", ""));
            }
            if (successKpi.getValue() instanceof String) {
                successRate = Double.parseDouble(((String) successKpi.getValue()).replace("%", ""));
            }
            
            double score = (userGrowth * 0.3 + successRate * 0.7);
            logger.debug("SystemHealthScore calculated: growth={}, success={}, final={}", userGrowth, successRate, score);
            return score;
        } catch (Exception e) {
            logger.error("Error calculating system health score", e);
            return 50.0; // Default middle score
        }
    }

    private String getHealthStatus(double score) {
        if (score >= 80) return "EXCELLENT";
        if (score >= 60) return "GOOD";
        if (score >= 40) return "WARNING";
        return "CRITICAL";
    }

    private Map<String, Long> getUserRoleDistribution() {
        Map<String, Long> distribution = new HashMap<>();
        distribution.put("ADMIN", userRepository.countByRoleAndDeletedFalse(UserRole.ADMIN));
        distribution.put("AGENT", userRepository.countByRoleAndDeletedFalse(UserRole.AGENT));
        distribution.put("CLIENT", userRepository.countByRoleAndDeletedFalse(UserRole.CLIENT));
        return distribution;
    }

    private Map<String, Long> getUserStatusDistribution() {
        // À implémenter selon la logique métier
        Map<String, Long> distribution = new HashMap<>();
        return distribution;
    }

    private Map<String, Long> getActionTypeDistribution(List<UserActivity> activities) {
        return activities.stream()
                .collect(Collectors.groupingBy(a -> a.getActionType().toString(), Collectors.counting()));
    }

    private double calculateVolumeScore(long totalActions, double teamAverageActions) {
        if (teamAverageActions <= 0) {
            return totalActions > 0 ? 50.0 : 0.0;
        }
        return Math.max(0, Math.min(100, (totalActions / teamAverageActions) * 100));
    }

    private String getPerformanceRank(double score) {
        if (score >= 90) return "EXCELLENT";
        if (score >= 75) return "VERY_GOOD";
        if (score >= 60) return "GOOD";
        if (score >= 45) return "FAIR";
        return "POOR";
    }

    private double calculateSuccessRateForAgent(Long agentId, Instant startDate, Instant endDate) {
        List<UserActivity> activities = userActivityRepository.findByUserIdAndTimestampBetween(agentId, startDate, endDate);
        long approvals = activities.stream()
                .filter(a -> a.getActionType() == UserActivityActionType.APPROVAL).count();
        return activities.size() > 0 ? (approvals / (double) activities.size()) * 100 : 0;
    }

    private TimeSeriesDataDTO getAgentActivityTimeSeries(Long agentId, String granularity, Instant startDate, Instant endDate) {
        TimeSeriesDataDTO timeSeries = new TimeSeriesDataDTO("agent_activity", granularity);
        List<String> labels = new ArrayList<>();
        List<Long> values = new ArrayList<>();

        Instant current = startDate;
        while (!current.isAfter(endDate)) {
            Instant periodEnd = current.plus(1, ChronoUnit.DAYS);
            long activitiesInPeriod = userActivityRepository.countByUserIdAndTimestampBetween(agentId, current, periodEnd);

            labels.add(current.toString().substring(0, 10));
            values.add(activitiesInPeriod);

            current = periodEnd;
        }

        timeSeries.setLabels(labels);
        timeSeries.setValues(values);
        return timeSeries;
    }

    private TimeSeriesDataDTO getAgentSuccessRateTimeSeries(Long agentId, String granularity, Instant startDate, Instant endDate) {
        TimeSeriesDataDTO timeSeries = new TimeSeriesDataDTO("agent_success_rate", granularity);
        List<String> labels = new ArrayList<>();
        List<Long> values = new ArrayList<>();

        Instant current = startDate;
        while (!current.isAfter(endDate)) {
            Instant periodEnd = current.plus(1, ChronoUnit.DAYS);
            List<UserActivity> periodActivities = userActivityRepository.findByUserIdAndTimestampBetween(agentId, current, periodEnd);
            long approvals = periodActivities.stream()
                    .filter(a -> a.getActionType() == UserActivityActionType.APPROVAL).count();

            labels.add(current.toString().substring(0, 10));
            values.add(periodActivities.size() > 0 ? Math.round((approvals / (double) periodActivities.size()) * 100) : 0);

            current = periodEnd;
        }

        timeSeries.setLabels(labels);
        timeSeries.setValues(values);
        return timeSeries;
    }
}
