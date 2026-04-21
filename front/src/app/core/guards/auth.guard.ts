import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

const checkAuth = (state?: RouterStateSnapshot): boolean => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const url = state?.url ?? '';
  if (url.startsWith('/admin') && !auth.isAdmin()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};

export const authGuard: CanActivateFn = (_, state) => checkAuth(state);
export const authChildGuard: CanActivateChildFn = (_, state) => checkAuth(state);
