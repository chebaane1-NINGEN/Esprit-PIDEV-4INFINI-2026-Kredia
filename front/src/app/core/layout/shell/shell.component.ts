import { ChangeDetectionStrategy, Component, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent implements OnInit {
  private readonly cdr    = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  isPublicPage = false;

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
    const path = url.split('?')[0];
    this.isPublicPage = [
      '/',
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
      '/cookies',
      '/login',
      '/signup',
      '/register',
      '/forgot-password',
      '/reset-password',
      '/oauth2/redirect'
    ].includes(path);
  }
}
