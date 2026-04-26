// Analytics Frontend Models for Dashboard

export interface KpiMetric {
  id: string;
  label: string;
  value: number | string;
  unit: string;
  trend?: number;
  trendDirection?: 'UP' | 'DOWN' | 'STABLE';
  lastUpdated?: number;
  description?: string;
}

export interface TimeSeriesData {
  metric: string;
  granularity: 'DAY' | 'WEEK' | 'MONTH' | 'CUSTOM';
  labels: string[];
  values: number[];
  breakdown?: Record<string, number>;
  totalValue: number;
  averageValue: number;
  peakValue?: number;
  peakDate?: string;
}

export interface DrillDownData {
  metric: string;
  period: string;
  calculatedValue: number | string;
  rawVariables: Record<string, any>;
  detailedData: Record<string, any>[];
  totalRecords: number;
  appliedFilters?: Record<string, string>;
  calculationFormula: string;
  lastCalculatedAt: string;
}

export interface AgentPerformanceScore {
  agentId: number;
  agentName: string;
  agentEmail: string;
  agentRole: string;
  
  // Scores
  successRate: number;
  volumeScore: number;
  speedScore: number;
  finalPerformanceScore: number;
  performanceRank: 'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'FAIR' | 'POOR';
  
  // Stats
  totalActions: number;
  approvalCount: number;
  rejectionCount: number;
  numberOfClientsHandled: number;
  averageProcessingTimeSeconds: number;
  
  // Team Comparison
  teamAverageSuccessRate: number;
  teamAverageVolume: number;
  teamAverageProcessingTime: number;
  teamSize: number;
  positionInTeam: string;
  
  // Time Series
  activityTimeSeries?: TimeSeriesData;
  successRateTimeSeries?: TimeSeriesData;
  processingTimeTimeSeries?: TimeSeriesData;
  
  // Portfolio
  activeClientsCount: number;
  totalClientsHandled: number;
  clientRetentionRate: number;
  topClients?: Record<string, any>[];
  
  // Activities
  recentActivities?: Record<string, any>[];
  actionTypeBreakdown?: Record<string, number>;
  
  // Extra
  qualityScore?: number;
  customerSatisfactionScore?: number;
  lastActivityTime?: number;
  lastActivityDescription?: string;
}

export interface EnhancedAnalyticsDashboard {
  generatedAt: number;
  period: string;
  
  // KPIs
  growthRate: KpiMetric;
  activityRate: KpiMetric;
  systemLoad: KpiMetric;
  successRate: KpiMetric;
  
  // Stats
  totalUsers: number;
  totalClients: number;
  totalAgents: number;
  activeUsers: number;
  blockedUsers: number;
  suspendedUsers: number;
  
  // Activity
  totalActions: number;
  approvalCount: number;
  rejectionCount: number;
  
  // Time Series
  userGrowthTimeSeries?: TimeSeriesData;
  activityTimeSeries?: TimeSeriesData;
  successRateTimeSeries?: TimeSeriesData;
  
  // System Health
  systemHealthScore: number;
  systemHealthStatus: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  componentHealth?: Record<string, number>;
  
  // Comparisons
  periodComparison?: Record<string, number>;
  
  // Distributions
  userRoleDistribution?: Record<string, number>;
  userStatusDistribution?: Record<string, number>;
  actionTypeDistribution?: Record<string, number>;
}

export interface SystemHealth {
  score: number;
  status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  lastUpdated: string;
  components: Record<string, number>;
}

export interface PeriodComparison {
  userGrowth: number;
  activityGrowth: number;
  [key: string]: number;
}
