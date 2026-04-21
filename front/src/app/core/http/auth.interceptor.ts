import { HttpInterceptorFn } from '@angular/common/http';

const getActorIdFromToken = (token: string): string | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(payload);
    const json = JSON.parse(decoded) as { sub?: string };
    return json.sub ?? null;
  } catch {
    return null;
  }
};

/**
 * Attache automatiquement le token JWT et l'actor ID à chaque requête HTTP sortante.
 * Compatible Angular standalone (HttpInterceptorFn).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  let cloned = req;

  if (token) {
    cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });

    const actorId = getActorIdFromToken(token);
    if (actorId) {
      cloned = cloned.clone({
        headers: cloned.headers.set('X-Actor-Id', actorId)
      });
    }
  }

  return next(cloned);
};
