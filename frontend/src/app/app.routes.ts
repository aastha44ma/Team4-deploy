import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Transactions } from './pages/transactions/transactions';
import { Budgets } from './pages/budgets/budgets';
import { TaxCalculator } from './pages/tax-calculator/tax-calculator';
import { Profile } from './pages/profile/profile';

import { authGuard } from './guards/auth.guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },


  // =========================
  // PUBLIC ROUTES
  // =========================

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



  // =========================
  // PROTECTED ROUTES
  // =========================


  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard')
        .then(m => m.Dashboard)
  },


  {
    path: 'income',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/income/income')
        .then(m => m.Income)
  },


  {
    path: 'expense',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/expense/expense')
        .then(m => m.Expense)
  },


  {
    path: 'transactions',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/transactions/transactions')
        .then(m => m.Transactions)
  },

  {
    path: 'budgets',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/budgets/budgets')
        .then(m => m.Budgets)
  },

  {
    path: 'tax-calculator',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/tax-calculator/tax-calculator')
        .then(m => m.TaxCalculator)
  },
  
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profile/profile')
        .then(m => m.Profile)
  },



  {
    path: '**',
    redirectTo: 'login'
  }

];
