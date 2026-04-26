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
  showPassword = false;
  touched = { email: false, password: false };

  readonly form = this.fb.nonNullable.group({
    email:      ['', [Validators.required, Validators.email]],
    password:   ['', [Validators.required, Validators.minLength(4)]],
    rememberMe: [false]
  });

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  markFieldTouched(field: 'email' | 'password'): void {
    this.touched[field] = true;
    this.cdr.markForCheck();
  }

  getFieldError(field: 'email' | 'password'): string | null {
    const control = this.form.get(field);
    if (!control || !this.touched[field] || !control.errors) {
      return null;
    }

    if (field === 'email') {
      if (control.hasError('required')) return 'Email is required';
      if (control.hasError('email')) return 'Please enter a valid email';
    }

    if (field === 'password') {
      if (control.hasError('required')) return 'Password is required';
      if (control.hasError('minlength')) return 'Password must be at least 4 characters';
    }

    return null;
  }

  isFieldValid(field: 'email' | 'password'): boolean {
    const control = this.form.get(field);
    return this.touched[field] && control?.valid === true;
  }

  submit(): void {
    if (this.form.invalid) {
      this.touched = { email: true, password: true };
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.auth.login(this.form.getRawValue()).subscribe({
      next: (response: LoginResponse) => {
        const saved = this.auth.saveToken(response);
        this.loading = false;

        if (!saved) {
          this.showToast('Token not found. Please try again.', 'error');
          this.cdr.markForCheck();
          return;
        }

        this.showToast('Login successful!', 'success');
        this.navigateAfterLogin();
      },
      error: (err) => {
        this.loading = false;
        const message =
          err?.error?.message ??
          err?.error?.error ??
          (err?.status === 0
            ? 'Unable to reach the server. Please check your connection.'
            : err?.status === 401
            ? 'Invalid email or password.'
            : err?.status === 403
            ? 'Account blocked or suspended.'
            : `Error ${err?.status ?? 'unknown'} — please try again.`);
        this.showToast(message, 'error');
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
      ? '/admin/dashboard'
      : this.auth.isAgent()
      ? '/agent/dashboard'
      : this.auth.isClient()
      ? '/client/dashboard'
      : '/user';

    this.zone.run(() => this.router.navigateByUrl(next));
  }

  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 4px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }
}
