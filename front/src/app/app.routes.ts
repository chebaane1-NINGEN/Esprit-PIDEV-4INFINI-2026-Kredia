import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { FeaturesComponent } from './pages/features/features.component';
import { Oauth2RedirectComponent } from './pages/oauth2-redirect/oauth2-redirect.component';
import { authGuard, authChildGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ── Public ─────────────────────────────────────────────
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'features', component: FeaturesComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', redirectTo: 'register', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'oauth2/redirect', component: Oauth2RedirectComponent },
  {
    path: 'admin',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.routes)
  },

  // ── Credit ─────────────────────────────────────────────
  {
    path: 'credit',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadChildren: () => import('./features/credit/Credit/credit.routes').then(m => m.routes)
  },

  // ── User ───────────────────────────────────────────────
  {
    path: 'user',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadChildren: () => import('./features/user/User/user.routes').then(m => m.routes)
  },
  {
    path: 'user/kyc-doc',
    canActivate: [authGuard],
    loadChildren: () => import('./features/user/KycDocument/kyc-document.routes').then(m => m.routes)
  },

  // ── Wallet ─────────────────────────────────────────────
  {
    path: 'wallet',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadChildren: () => import('./features/wallet/Wallet/wallet.routes').then(m => m.routes)
  },
  {
    path: 'wallet/transactions',
    canActivate: [authGuard],
    loadChildren: () => import('./features/wallet/Transaction/transaction.routes').then(m => m.routes)
  },
  {
    path: 'wallet/audit',
    canActivate: [authGuard],
    loadChildren: () => import('./features/wallet/TransactionAuditLog/transaction-audit-log.routes').then(m => m.routes)
  },
  {
    path: 'wallet/loan-transactions',
    canActivate: [authGuard],
    loadChildren: () => import('./features/wallet/TransactionLoan/transaction-loan.routes').then(m => m.routes)
  },
  {
    path: 'wallet/virtual-card',
    canActivate: [authGuard],
    loadChildren: () => import('./features/wallet/VirtualCard/virtual-card.routes').then(m => m.routes)
  },

  // ── Support ────────────────────────────────────────────
  {
    path: 'support/notifications',
    canActivate: [authGuard],
    loadChildren: () => import('./features/support/Notification/notification.routes').then(m => m.routes)
  },
  {
    path: 'support/reclamations',
    canActivate: [authGuard],
    loadChildren: () => import('./features/support/Reclamation/reclamation.routes').then(m => m.routes)
  },
  {
    path: 'support/reclamation-attachments',
    canActivate: [authGuard],
    loadChildren: () => import('./features/support/ReclamationAttachment/reclamation-attachment.routes').then(m => m.routes)
  },
  {
    path: 'support/reclamation-history',
    canActivate: [authGuard],
    loadChildren: () => import('./features/support/ReclamationHistory/reclamation-history.routes').then(m => m.routes)
  },
  {
    path: 'support/reclamation-messages',
    canActivate: [authGuard],
    loadChildren: () => import('./features/support/ReclamationMessage/reclamation-message.routes').then(m => m.routes)
  },

  // ── Investment ─────────────────────────────────────────
  {
    path: 'investissement/assets',
    canActivate: [authGuard],
    loadChildren: () => import('./features/investment/InvestmentAsset/investment-asset.routes').then(m => m.routes)
  },
  {
    path: 'investissement/orders',
    canActivate: [authGuard],
    loadChildren: () => import('./features/investment/InvestmentOrder/investment-order.routes').then(m => m.routes)
  },
  {
    path: 'investissement/strategies',
    canActivate: [authGuard],
    loadChildren: () => import('./features/investment/InvestmentStrategy/investment-strategy.routes').then(m => m.routes)
  },
  {
    path: 'investissement/portfolio',
    canActivate: [authGuard],
    loadChildren: () => import('./features/investment/PortfolioPosition/portfolio-position.routes').then(m => m.routes)
  },

  // ── Fallback ───────────────────────────────────────────
  { path: '**', redirectTo: '' }
];
