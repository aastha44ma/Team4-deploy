import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/auth').then(
        m => m.Auth
      )
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/auth').then(
        m => m.Auth
      )
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];