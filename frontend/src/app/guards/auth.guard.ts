import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Router, CanActivateFn } from '@angular/router';
import { ApiService } from '../services/api';

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);
  const apiService = inject(ApiService);

  // 🚀 TEMPORARY BYPASS FOR DEVELOPMENT: Always allow access
  return true; 
  // 🚀 TEMPORARY BYPASS FOR DEVELOPMENT: Always allow access
  return true; 

  /* 
  --- COMMENTED OUT FOR DEVELOPMENT ---
  /* 
  --- COMMENTED OUT FOR DEVELOPMENT ---
  const token = apiService.getToken();

  if (token) {
    return true;
  }

  router.navigate(['/login']);
  return false;
  */
  */
};