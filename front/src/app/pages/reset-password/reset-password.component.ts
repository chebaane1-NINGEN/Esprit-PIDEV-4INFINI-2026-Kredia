import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  loading = false;
  error: string | null = null;
  success: string | null = null;
  token: string | null = null;

  readonly form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    },
    { validators: [this.passwordMatchValidator] }
  );

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.error = 'Lien de réinitialisation invalide ou expiré.';
    }
  }

  submit(): void {
    if (!this.token) {
      this.error = 'Impossible de traiter la réinitialisation sans token.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    this.auth.resetPassword(this.token, this.form.controls.password.value).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.';
        setTimeout(() => this.router.navigate(['/login']), 1400);
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.message ??
          err?.error?.error ??
          (err?.status === 0
            ? 'Impossible de joindre le serveur.'
            : `Erreur ${err?.status ?? ''} — réessayez.`);
      }
    });
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }
}
