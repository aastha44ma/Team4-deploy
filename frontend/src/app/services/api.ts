import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // =========================================================
  // HTTP OPTIONS
  // =========================================================

  private getOptions() {

    const token = this.getToken();

    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${token}`
      );
    }

    return {
      headers,
      withCredentials: true
    };
  }


  // =========================================================
  // AUTH
  // =========================================================

  register(data: any) {

    return this.http.post(
      `${this.baseUrl}/auth/register`,
      data,
      this.getOptions()
    );
  }


  login(data: any) {

    return this.http.post(
      `${this.baseUrl}/auth/login`,
      data,
      this.getOptions()
    );
  }


  // =========================================================
  // LOCAL STORAGE
  // =========================================================

  saveToken(token: string) {

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'accessToken',
        token
      );
    }
  }


  getToken() {

    if (typeof window !== 'undefined') {

      return localStorage.getItem(
        'accessToken'
      );

    }

    return null;
  }


  saveUser(user: any) {

    if (typeof window !== 'undefined') {

      localStorage.setItem(
        'user',
        JSON.stringify(user)
      );

    }
  }


  getUser() {

    if (typeof window !== 'undefined') {

      const user =
        localStorage.getItem('user');

      return user
        ? JSON.parse(user)
        : null;
    }

    return null;
  }


  logout() {

    if (typeof window !== 'undefined') {

      localStorage.removeItem(
        'accessToken'
      );

      localStorage.removeItem(
        'user'
      );

    }
  }


  // =========================================================
  // TRANSACTIONS
  // =========================================================

  getTransactions() {

    return this.http.get(
      `${this.baseUrl}/transactions`,
      this.getOptions()
    );
  }


  createTransaction(data: any) {

    return this.http.post(
      `${this.baseUrl}/transactions`,
      data,
      this.getOptions()
    );
  }


  deleteTransaction(id: string) {

    return this.http.delete(
      `${this.baseUrl}/transactions/${id}`,
      this.getOptions()
    );
  }


  // =========================================================
  // BUDGET
  // =========================================================

  getBudgets(month?: string) {

    const url = month
      ? `${this.baseUrl}/budgets?month=${month}`
      : `${this.baseUrl}/budgets`;

    return this.http.get(
      url,
      this.getOptions()
    );
  }


  createBudget(data: any) {

    return this.http.post(
      `${this.baseUrl}/budgets`,
      data,
      this.getOptions()
    );
  }


  updateBudget(
    id: number,
    data: any
  ) {

    return this.http.put(
      `${this.baseUrl}/budgets/${id}`,
      data,
      this.getOptions()
    );
  }


  deleteBudget(id: number) {

    return this.http.delete(
      `${this.baseUrl}/budgets/${id}`,
      this.getOptions()
    );
  }


  // =========================================================
  // PROFILE
  // =========================================================

  getProfile() {

    return this.http.get(
      `${this.baseUrl}/user/profile`,
      this.getOptions()
    );
  }


  updateProfile(data: any) {

    return this.http.put(
      `${this.baseUrl}/user/profile`,
      data,
      this.getOptions()
    );
  }


  changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }) {

    return this.http.put(
      `${this.baseUrl}/user/password`,
      data,
      this.getOptions()
    );
  }


  // =========================================================
  // CATEGORY
  // =========================================================

  getCategories() {

    return this.http.get(
      `${this.baseUrl}/categories`,
      this.getOptions()
    );
  }


  getCategoriesByType(
    type: 'expense' | 'income'
  ) {

    return this.http.get(
      `${this.baseUrl}/categories/type/${type}`,
      this.getOptions()
    );
  }


  createCategory(data: {
    name: string;
    type: 'expense' | 'income';
    color?: string;
    icon?: string;
  }) {

    return this.http.post(
      `${this.baseUrl}/categories`,
      data,
      this.getOptions()
    );
  }


  updateCategory(
    categoryId: string,
    data: {
      name?: string;
      color?: string;
      icon?: string;
    }
  ) {

    return this.http.put(
      `${this.baseUrl}/categories/${categoryId}`,
      data,
      this.getOptions()
    );
  }


  deleteCategory(categoryId: string) {

    return this.http.delete(
      `${this.baseUrl}/categories/${categoryId}`,
      this.getOptions()
    );
  }


  initializeDefaultCategories() {

    return this.http.post(
      `${this.baseUrl}/categories/initialize-default`,
      {},
      this.getOptions()
    );
  }


  // =========================================================
  // DASHBOARD
  // =========================================================

  getDashboard() {

    return this.http.get(
      `${this.baseUrl}/dashboard`,
      this.getOptions()
    );
  }

}