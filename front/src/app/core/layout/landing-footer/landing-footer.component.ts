import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="landing-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <strong>KREDIA</strong>
          <p>Modern financial infrastructure for credit and investing teams.</p>
        </div>
        <div class="footer-links-grid">
          <div>
            <h4>Product</h4>
            <a routerLink="/features">Features</a>
            <a routerLink="/security">Security</a>
            <a routerLink="/pricing">Pricing</a>
          </div>
          <div>
            <h4>Company</h4>
            <a routerLink="/about">About</a>
            <a routerLink="/careers">Careers</a>
            <a routerLink="/blog">Blog</a>
          </div>
          <div>
            <h4>Support</h4>
            <a routerLink="/help">Help center</a>
            <a routerLink="/contact">Contact</a>
            <a routerLink="/status">Status</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 Kredia Technologies. All rights reserved.</p>
        <div class="footer-legal">
          <a routerLink="/privacy">Privacy</a>
          <a routerLink="/terms">Terms</a>
          <a routerLink="/cookies">Cookies</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .landing-footer {
      background: #0f172a;
      color: white;
      padding: 80px 48px 40px;
    }
    .footer-inner {
      max-width: 1320px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.5fr 3fr;
      gap: 80px;
      margin-bottom: 80px;
    }
    .footer-brand strong { font-size: 1.5rem; display: block; margin-bottom: 16px; }
    .footer-brand p { color: #94a3b8; line-height: 1.6; max-width: 300px; }
    .footer-links-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 40px;
    }
    .footer-links-grid h4 { margin-bottom: 24px; font-size: 1rem; }
    .footer-links-grid a { display: block; color: #94a3b8; text-decoration: none; margin-bottom: 12px; font-size: 0.9rem; }
    .footer-links-grid a:hover { color: #10b981; }
    .footer-bottom {
      max-width: 1320px;
      margin: 0 auto;
      padding-top: 40px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      color: #64748b;
      font-size: 0.85rem;
    }
    .footer-legal { display: flex; gap: 24px; }
    .footer-legal a:hover { color: white; }
  `]
})
export class LandingFooterComponent {}
