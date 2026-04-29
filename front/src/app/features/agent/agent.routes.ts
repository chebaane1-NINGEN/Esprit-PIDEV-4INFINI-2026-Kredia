import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/agent-dashboard-page/agent-dashboard-page.component').then(m => m.AgentDashboardPageComponent)
  },
  {
    path: 'clients',
    loadComponent: () => import('./pages/agent-clients-page/agent-clients-page.component').then(m => m.AgentClientsPageComponent)
  },
  {
    path: 'clients/new',
    loadComponent: () => import('./pages/agent-client-form-page/agent-client-form-page.component').then(m => m.AgentClientFormPageComponent)
  },
  {
    path: 'clients/:id',
    loadComponent: () => import('./pages/agent-client-details-page/agent-client-details-page.component').then(m => m.AgentClientDetailsPageComponent)
  },
  {
    path: 'performance',
    loadComponent: () => import('./pages/agent-performance-page/agent-performance-page.component').then(m => m.AgentPerformancePageComponent)
  },
  {
    path: 'audit',
    loadComponent: () => import('./pages/agent-audit-page/agent-audit-page.component').then(m => m.AgentAuditPageComponent)
  }
];