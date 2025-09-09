import { Routes } from '@angular/router';

// Define the routes for the application
// This file contains the routes related to authentication
export const authRoutes: Routes = [
    {
      path: 'login',
      loadComponent: () => import('@auth/login/login.component').then(m => m.LoginComponent),
      title: 'Login | Chatwords',
    },
    {
      path: 'create-account',
      loadComponent: () => import('@auth/register/register.component').then(m => m.RegisterComponent),
      title: 'Sign-up | Chatwords',
    }
];