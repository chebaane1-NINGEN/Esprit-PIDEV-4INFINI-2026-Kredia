package com.kredia.service.analytics;

import com.kredia.dto.analytics.*;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * AnalyticsService: Interface pour le calcul en temps réel de tous les KPIs
 * Responsabilités:
 * - Calcul fiable des croissance, activité, charge système, taux succès
 * - Agrégation de données par période (jour, semaine, mois, custom)
 * - Fournir les données brutes pour les drill-downs
 * - Calcul du score de performance des agents
 * - Vue 360° des agents avec toutes les comparaisons
 */
public interface AnalyticsService {

    // ==================== DASHBOARD PRINCIPAL ====================
    
    /**
     * Récupère le tableau de bord analytique complet
     * @param actorId L'ID de l'utilisateur qui demande
     * @param days Nombre de jours pour l'analyse (ex: 30, 90)
     * @return Dashboard avec tous les KPIs, données temporelles et comparaisons
     */
    EnhancedAnalyticsDashboardDTO getEnhancedAnalyticsDashboard(Long actorId, int days);

    // ==================== KPIs PRINCIPALES ====================
    
    /**
     * Growth Rate: (nouveau_utilisateurs / total_utilisateurs) * 100
     * @param actorId L'ID de l'utilisateur qui demande
     * @param startDate Début de la période
     * @param endDate Fin de la période
     * @return KPI avec trend
     */
    KpiMetricDTO calculateGrowthRate(Long actorId, Instant startDate, Instant endDate);

    /**
     * Activity Rate: total_actions / période_en_jours
     * @param actorId L'ID de l'utilisateur qui demande
     * @param startDate Début de la période
     * @param endDate Fin de la période
     * @return KPI avec trend
     */
    KpiMetricDTO calculateActivityRate(Long actorId, Instant startDate, Instant endDate);

    /**
     * System Load: Basé sur les actions en cours, utilisateurs actifs, etc
     * @param actorId L'ID de l'utilisateur qui demande
     * @return KPI avec trend
     */
    KpiMetricDTO calculateSystemLoad(Long actorId);

    /**
     * Success Rate: (approvals / total_attempts) * 100
     * @param actorId L'ID de l'utilisateur qui demande
     * @param startDate Début de la période
     * @param endDate Fin de la période
     * @return KPI avec trend
     */
    KpiMetricDTO calculateSuccessRate(Long actorId, Instant startDate, Instant endDate);

    // ==================== DONNÉES TEMPORELLES ====================
    
    /**
     * Agrégation de croissance utilisateurs par période
     * @param actorId L'ID de l'utilisateur qui demande
     * @param granularity DAY, WEEK, MONTH, ou null pour auto-déterminer
     * @param startDate Début de la période
     * @param endDate Fin de la période
     * @return Données temporelles avec labels, valeurs, et breakdown par rôle/statut
     */
    TimeSeriesDataDTO getUserGrowthTimeSeries(Long actorId, String granularity, Instant startDate, Instant endDate);

    /**
     * Agrégation d'activité par période
     * @param actorId L'ID de l'utilisateur qui demande
     * @param granularity DAY, WEEK, MONTH, ou null pour auto-déterminer
     * @param startDate Début de la période
     * @param endDate Fin de la période
     * @return Données temporelles avec breakdown par type d'action
     */
    TimeSeriesDataDTO getActivityTimeSeries(Long actorId, String granularity, Instant startDate, Instant endDate);

    /**
     * Agrégation du taux de succès par période
     * @param actorId L'ID de l'utilisateur qui demande
     * @param granularity DAY, WEEK, MONTH
     * @param startDate Début de la période
     * @param endDate Fin de la période
     * @return Taux de succès par période
     */
    TimeSeriesDataDTO getSuccessRateTimeSeries(Long actorId, String granularity, Instant startDate, Instant endDate);

    // ==================== DRILL-DOWN DONNÉES BRUTES ====================
    
    /**
     * Récupère les données brutes derrière le Growth Rate
     * Inclut: formule, variables brutes, et liste des nouveaux utilisateurs
     * @param actorId L'ID de l'utilisateur qui demande
     * @param startDate Début
     * @param endDate Fin
     * @return Données détaillées avec enregistrements individuels
     */
    DrillDownDataDTO drillDownGrowthRate(Long actorId, Instant startDate, Instant endDate);

    /**
     * Récupère les données brutes derrière l'Activity Rate
     * Inclut: tous les logs d'activité utilisateur pendant la période
     * @param actorId L'ID de l'utilisateur qui demande
     * @param startDate Début
     * @param endDate Fin
     * @return Données détaillées avec tous les enregistrements d'activité
     */
    DrillDownDataDTO drillDownActivityRate(Long actorId, Instant startDate, Instant endDate);

    /**
     * Récupère les données brutes derrière le System Load
     * Inclut: sessions actives, opérations en cours, etc
     * @param actorId L'ID de l'utilisateur qui demande
     * @return Données détaillées
     */
    DrillDownDataDTO drillDownSystemLoad(Long actorId);

    /**
     * Récupère les données brutes derrière le Success Rate
     * Inclut: toutes les approbations et rejections avec détails
     * @param actorId L'ID de l'utilisateur qui demande
     * @param startDate Début
     * @param endDate Fin
     * @return Données détaillées
     */
    DrillDownDataDTO drillDownSuccessRate(Long actorId, Instant startDate, Instant endDate);

    // ==================== AGENT PERFORMANCE ====================
    
    /**
     * Calcul du score de performance d'un agent
     * Formule: (successRate * 0.6) + (volumeScore * 0.3) + (speedScore * 0.1)
     * @param actorId L'ID de l'utilisateur qui demande
     * @param agentId L'ID de l'agent
     * @param days Nombre de jours d'analyse
     * @return Score complet avec toutes les comparaisons d'équipe
     */
    AgentPerformanceScoreDTO calculateAgentPerformanceScore(Long actorId, Long agentId, int days);

    /**
     * Vue 360° d'un agent: profil complet avec timelines, portfolio, comparaisons
     * @param actorId L'ID de l'utilisateur qui demande
     * @param agentId L'ID de l'agent
     * @return Profil détaillé avec toutes les données
     */
    AgentPerformanceScoreDTO getAgent360View(Long actorId, Long agentId);

    /**
     * Classement de performance de tous les agents
     * @param actorId L'ID de l'utilisateur qui demande
     * @param limit Nombre d'agents à retourner (ex: 10)
     * @return Liste des agents classés par score décroissant
     */
    List<AgentPerformanceScoreDTO> getAgentPerformanceRanking(Long actorId, int limit);

    /**
     * Drill-down sur la performance d'un agent
     * Détails complets: tous les logs, clients, actions, etc
     * @param actorId L'ID de l'utilisateur qui demande
     * @param agentId L'ID de l'agent
     * @return Données brutes pour visualisation détaillée
     */
    DrillDownDataDTO drillDownAgentPerformance(Long actorId, Long agentId);

    // ==================== SANTÉ SYSTÈME ====================
    
    /**
     * Score de santé du système (0-100)
     * Basé sur: performance des requêtes, disponibilité API, erreurs, etc
     * @param actorId L'ID de l'utilisateur qui demande
     * @return Score global et détail par composant
     */
    java.util.Map<String, Object> calculateSystemHealth(Long actorId);

    // ==================== COMPARAISONS ====================
    
    /**
     * Compare les métriques entre deux périodes (croissance/décroissance)
     * @param actorId L'ID de l'utilisateur qui demande
     * @param days1 Nombre de jours pour la première période
     * @param days2 Nombre de jours pour la deuxième période (optionnel, par défaut: 2*days1)
     * @return Comparaison avec pourcentages de croissance
     */
    java.util.Map<String, Double> comparePeriods(Long actorId, int days1, Optional<Integer> days2);
}
