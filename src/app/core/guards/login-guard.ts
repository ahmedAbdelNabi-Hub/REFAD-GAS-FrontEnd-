import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  if (!isBrowser) {
    return true;
  }
  if (!authService.userId) {
    return true;
  }

  const role = authService.role?.toLowerCase();

  if (role === 'admin' || role === 'company') {
    return router.createUrlTree(['/dashboard/statistics']);
  }

  return true;
};
