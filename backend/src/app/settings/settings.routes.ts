import { Routes } from '@angular/router';

// Define the routes for the settings module
// This file contains the routes related to user settings, including profile management, password changes, and account management
export const settingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('@settings/settings.component').then(m => m.SettingsComponent),
    children: [
      {
        path: 'account',
        loadComponent: () => import('@settings/account/account.component').then(m => m.AccountComponent),
      },
      {
        path: 'change-password',
        loadComponent: () => import('@settings/change-password/change-password.component').then(m => m.ChangePasswordComponent),
      },
      {
        path: 'preferences',
        loadComponent: () => import('@settings/preferences/preferences.component').then(m => m.PreferencesComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('@settings/profile/profile.component').then(m => m.ProfileComponent),
      },
      { 
        path: '', 
        redirectTo: 'profile', 
        pathMatch: 'full' 
      }
    ]
  }
];
