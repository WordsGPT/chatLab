import { Routes } from '@angular/router';

import { authRoutes } from '@auth/auth.routes';
import { authGuard } from '@core/guards/auth.guard';
import { experimentGuard } from '@core/guards/experiment.guard';

// Define the routes for the application
export const routes: Routes = [
    ...authRoutes,
    {
        path: '', 
        canActivate: [authGuard],
        loadComponent: () => import('@experiments/experiments.component').then(m => m.ExperimentsComponent),
        title: 'Experiments | Chatwords'
    },
    {
        path: 'not-found',
        loadComponent: () => import('@notFound/not-found.component').then(m => m.NotFoundComponent),
        title: 'Not Found | Chatwords',
    },
    {
        path: 'history',
        canActivate: [authGuard],
        loadComponent: () => import('@experiments-history/experiments-history.component').then(m => m.ExperimentsHistoryComponent),
        title: 'Experiments History | Chatwords'
    },
    {
        path: 'experiment',
        canActivate: [authGuard, experimentGuard],
        loadComponent: () => import('@executions/executions.component').then(m => m.ExecutionsComponent),
        title: 'Executions | Chatwords',
    },
    {
        path: 'experiment/history',
        canActivate: [authGuard, experimentGuard],
        loadComponent: () => import('@executions-history/executions-history.component').then(m => m.ExecutionsHistoryComponent),
        title: 'Executions History | Chatwords',
    },
    {
        path: 'settings',
        canActivate: [authGuard],
        loadChildren: () => import('@settings/settings.routes').then(m => m.settingsRoutes),
        title: 'Settings | Chatwords',
    },
    {
        path: '**',
        redirectTo: 'not-found',
    }
];
