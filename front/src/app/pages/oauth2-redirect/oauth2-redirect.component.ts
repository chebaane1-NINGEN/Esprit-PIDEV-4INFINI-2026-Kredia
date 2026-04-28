import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-oauth2-redirect',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './oauth2-redirect.component.html',
  styleUrl: './oauth2-redirect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Oauth2RedirectComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  message = 'Connexion en cours...';
  loading = true;

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.loading = false;
      this.message = 'Aucun jeton OAuth trouvé. Vérifiez la configuration du service.';
      return;
    }

    const saved = this.auth.saveTokenFromString(token);
    if (!saved) {
      this.loading = false;
      this.message = 'Impossible de sauvegarder votre session. Réessayez plus tard.';
      return;
    }

    this.message = 'Authentification réussie. Redirection...';
    setTimeout(() => this.router.navigateByUrl(this.auth.getDashboardRoute()), 600);
  }
}
