// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  if (!isBrowser) {
    return true;
  }

  try {
    if (authService.isAuthLoading()) {
      await firstValueFrom(authService.init());
    }
  } catch (error) {
    console.error('Auth initialization failed:', error);
  }

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  // === Role-based access ===
  const requiredRole = route.data?.['role'] as string | undefined;
  if (requiredRole) {
    const userRole = authService.role;
    if (userRole !== requiredRole) {
      return router.createUrlTree(['/unauthorized']);
    }
  }
  return true;
};