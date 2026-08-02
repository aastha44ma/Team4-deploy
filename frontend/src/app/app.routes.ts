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
      import('./pages/auth/auth')
        .then(m => m.Auth)
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/auth')
        .then(m => m.Auth)
  },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard')
        .then(m => m.Dashboard)
  },

  {
    path: 'income',
    loadComponent: () =>
      import('./pages/income/income')
        .then(m => m.Income)
  },

  {
    path: 'expense',
    loadComponent: () =>
      import('./pages/expense/expense')
        .then(m => m.Expense)
  },

  {
    path: 'transactions',
    loadComponent: () =>
      import('./pages/transactions/transactions')
        .then(m => m.Transactions)
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];