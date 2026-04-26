import { Routes } from '@angular/router';
import { AnalyticsDashboardComponent } from './pages/analytics-dashboard/analytics-dashboard.component';
import { AgentPerformanceComponent } from './pages/agent-performance/agent-performance.component';

export const ANALYTICS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: AnalyticsDashboardComponent,
    data: { title: 'Analytics Dashboard' }
  },
  {
    path: 'agents',
    component: AgentPerformanceComponent,
    data: { title: 'Agent Performance' }
  }
];
