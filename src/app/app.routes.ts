import { Routes } from '@angular/router';
import { ADMIN_ROUTES } from './layouts/admin-layout/admin.routes';
import { AUTH_ROUTES } from './layouts/auth-layout/auth.routes';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./layouts/auth-layout/auth-layout.component').then(
                (m) => m.AuthLayoutComponent
            ),
        children: AUTH_ROUTES,
    },
    {
        path: 'admin',
        loadComponent: () =>
            import('./layouts/admin-layout/admin-layout.component').then(
                (m) => m.AdminLayoutComponent
            ),
        children: ADMIN_ROUTES,
    },
    { path: '**', redirectTo: 'login' },
];
