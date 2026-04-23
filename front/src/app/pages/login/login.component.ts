import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { API_BASE_URL } from '../../core/http/api.config';
import { AuthService, LoginResponse } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb     = inject(FormBuilder);
  private readonly cdr    = inject(ChangeDetectorRef);
  private readonly zone   = inject(NgZone);

  loading = false;
  error: string | null = null;

  readonly form = this.fb.nonNullable.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.error   = null;
    this.cdr.markForCheck();

    this.auth.login(this.form.getRawValue()).subscribe({
      next: (response: LoginResponse) => {
        const saved = this.auth.saveToken(response);
        this.loading = false;

        if (!saved) {
          this.error = 'Token introuvable. Veuillez réessayer.';
          this.cdr.markForCheck();
          return;
        }

        this.navigateAfterLogin();
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.message ??
          err?.error?.error ??
          (err?.status === 0
            ? 'Impossible de joindre le serveur.'
            : err?.status === 401
            ? 'Email ou mot de passe incorrect.'
            : `Erreur ${err?.status ?? ''} — réessayez.`);
        this.cdr.markForCheck();
      }
    });
  }

  loginWithProvider(provider: 'google' | 'github'): void {
    this.loading = true;
    window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`;
  }

  private navigateAfterLogin(): void {
    const next = this.auth.isAdmin()
      ? '/admin'
      : this.auth.isAgent()
      ? '/agent/dashboard'
      : this.auth.isClient()
      ? '/credit/list'
      : '/user';

    this.zone.run(() => this.router.navigateByUrl(next));
  }
}
