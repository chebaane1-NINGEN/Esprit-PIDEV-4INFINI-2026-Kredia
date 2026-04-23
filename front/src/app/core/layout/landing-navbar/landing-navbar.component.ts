import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="hero-navbar">
      <div class="navbar-inner">
        <a routerLink="/" class="navbar-brand">
          <span class="brand-mark">●</span> KREDIA
        </a>
        <nav class="navbar-menu" aria-label="Main navigation">
          <a routerLink="/features">Features</a>
          <a routerLink="/pricing">Pricing</a>
          <a routerLink="/security">Security</a>
          <a routerLink="/about">About</a>
          <a routerLink="/contact">Contact</a>
        </nav>
        <a routerLink="/login" class="navbar-login">Sign in</a>
      </div>
    </header>
  `,
  styles: [`
    .hero-navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(15, 23, 42, 0.08);
      padding: 12px 0;
    }
    .navbar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;
      max-width: 1320px;
      margin: 0 auto;
      padding: 0 48px;
    }
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.4rem;
      font-weight: 800;
      color: #0f172a;
      text-decoration: none;
      .brand-mark { color: #10b981; font-size: 1.8rem; }
    }
    .navbar-menu {
      display: flex;
      gap: 32px;
      a {
        color: #475569;
        text-decoration: none;
        font-size: 0.95rem;
        font-weight: 500;
        &:hover { color: #10b981; }
      }
    }
    .navbar-login {
      padding: 8px 16px;
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 6px;
      color: #0f172a;
      text-decoration: none;
      font-weight: 600;
      &:hover { border-color: #10b981; color: #10b981; }
    }
  `]
})
export class LandingNavbarComponent {}
