import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  loading = false;
  error: string | null = null;
  success: string | null = null;

  readonly form = this.fb.nonNullable.group(
    {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    },
    { validators: [this.passwordMatchValidator] }
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const { firstName, lastName, email, phoneNumber, password } = this.form.getRawValue();

    this.auth.register({ firstName, lastName, email, phoneNumber, password }).subscribe({
      next: () => {
        this.success = 'Votre compte a été créé. Vous pouvez maintenant vous connecter.';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 1400);
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.message ??
          err?.error?.error ??
          (err?.status === 0
            ? 'Impossible de contacter le serveur.'
            : `Erreur ${err?.status ?? ''} — réessayez.`);
      }
    });
  }

  hasFieldError(name: string, errorKey: string): boolean {
    const field = this.form.get(name);
    return !!field && field.touched && field.hasError(errorKey);
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }
}
