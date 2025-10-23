import { Routes } from "@angular/router";

export const AUTH_ROUTES: Routes = [
    { path: 'login', loadComponent: () => import('../../features/auth/pages/login/login').then(m => m.Login) },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];

