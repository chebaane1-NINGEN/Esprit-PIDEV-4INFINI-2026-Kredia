import { Routes } from '@angular/router';
import { AdminUsersPageComponent } from './pages/admin-users-page/admin-users-page.component';
import { AdminAnalyticsPageComponent } from './pages/admin-analytics-page/admin-analytics-page.component';
import { AdminAgentsPageComponent } from './pages/admin-agents-page/admin-agents-page.component';
import { AdminAuditPageComponent } from './pages/admin-audit-page/admin-audit-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  { path: 'users', component: AdminUsersPageComponent },
  { path: 'analytics', component: AdminAnalyticsPageComponent },
  { path: 'agents', component: AdminAgentsPageComponent },
  { path: 'audit', component: AdminAuditPageComponent }
];
