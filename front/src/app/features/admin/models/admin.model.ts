export type UserRole = 'ADMIN' | 'AGENT' | 'CLIENT' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BLOCKED';

export interface UserResponse {
  userId?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp?: string;
}

export interface AdminStats {
  totalUser: number;
  totalClient: number;
  totalAgent: number;
  activeUser: number;
  blockedUser: number;
  suspendedUser: number;
  last24hRegistrations: number;
  roleDistribution?: Record<string, number>;
  systemHealthIndex: number;
  registrationEvolution?: Record<string, number>;
  recentActivities?: UserActivity[];
}

export interface AgentPerformance {
  approvalActionsCount: number;
  rejectionActionsCount: number;
  totalActions: number;
  performanceScore: number;
  numberOfClientsHandled: number;
  averageProcessingTimeSeconds: number;
}

export interface UserActivity {
  id?: number;
  userId?: number;
  actionType?: string;
  description?: string;
  timestamp?: string;
}

export interface SystemDashboardStats {
  totalWallets?: number;
  totalTransactions?: number;
  transactionsByStatus?: Record<string, number>;
  totalCompletedTransactionVolume?: number;
  totalFraudulentTransactions?: number;
  totalFraudulentVolume?: number;
}
