import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './layouts/auth-layout/auth.routes';
import { loginGuard } from './core/guards/login-guard';
import { authGuard } from './core/guards/auth-guard';
import { DASHBOARD_ROUTES } from './layouts/dashboard-layout/dashboard.routes';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
        canActivate: [loginGuard],
        children: AUTH_ROUTES,
    },
    {
        path: 'dashboard',
        data: { roles: ['admin', 'company'] },
        loadComponent:
         () => import('./layouts/dashboard-layout/dashboard-layout.component')
         .then((m) => m.DashboardLayoutComponent),
        canActivate: [authGuard],
        children: DASHBOARD_ROUTES,
    },

    { path: '**', redirectTo: 'login' },
];
