import { ChangeDetectionStrategy, Component, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LandingNavbarComponent } from '../landing-navbar/landing-navbar.component';
import { LandingFooterComponent } from '../landing-footer/landing-footer.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    NavbarComponent, 
    SidebarComponent, 
    LandingNavbarComponent, 
    LandingFooterComponent
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent implements OnInit {
  private readonly cdr    = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  isPublicPage = false;
  isAuthPage = false;

  ngOnInit(): void {
    this.updateFlags(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateFlags(event.urlAfterRedirects || event.url);
      this.cdr.markForCheck();
    });
  }

  private updateFlags(url: string): void {
    const path = url.split('?')[0].replace(/\/$/, ''); // Remove trailing slash
    
    const authPaths = [
      '/login',
      '/signup',
      '/register',
      '/forgot-password',
      '/reset-password',
      '/oauth2/redirect'
    ];

    const landingPaths = [
      '',
      '/home',
      '/features',
      '/security',
      '/pricing',
      '/about',
      '/careers',
      '/blog',
      '/help',
      '/contact',
      '/status',
      '/privacy',
      '/terms',
      '/cookies'
    ];
    
    this.isAuthPage = authPaths.includes(path);
    this.isPublicPage = landingPaths.includes(path) || path === '';
  }
}
