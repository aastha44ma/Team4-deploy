import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions implements OnInit {

  transactions: any[] = [];

  isLoading = false;
  errorMessage = '';

  userName = 'Freelancer';
  isLightTheme = false;

  // Add Transaction Form
  showAddForm = false;

  transactionType = 'Income';
  customCategory = '';
  isOtherCategory = false;

  category = '';

  incomeCategories = [

    'Salary',
    'Freelancing',
    'Consulting',
    'Investment',
    'Bonus',
    'Refund',
    'Other'

  ];

  expenseCategories = [

    'Office Supplies',
    'Software & SaaS',
    'Hardware & Equipment',
    'Internet & Communication',
    'Travel & Transportation',
    'Food & Client Meetings',
    'Marketing & Advertising',
    'Professional Services',
    'Learning & Courses',
    'Subscriptions',
    'Bank Charges & Fees',
    'Insurance',
    'Taxes',
    'Rent & Workspace',
    'Utilities',
    'Other'

  ];

  amount: number | null = null;
  transactionDate = '';

  amountError = '';
  categoryError = '';
  dateError = '';

  isFormSubmitted = false;
  isFormLoading = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    // Theme
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'light') {
      this.isLightTheme = true;
      document.body.classList.add('light-theme');
    } else {
      this.isLightTheme = false;
      document.body.classList.remove('light-theme');
    }

    // User
    const userStr = localStorage.getItem('user');

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userName = user.name || user.fullName || 'Freelancer';
      } catch (e) {
        console.error(e);
      }
    }

    // Today's Date
    this.transactionDate = new Date().toISOString().split('T')[0];

    this.loadTransactions();
  }

  toggleTheme() {

    this.isLightTheme = !this.isLightTheme;

    if (this.isLightTheme) {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  }
  loadTransactions() {

    console.log("load called");

    this.isLoading = true;

    this.api.getTransactions().subscribe({

      next: (res: any) => {

        console.log("API DATA", res);

        this.transactions = [...(res.transactions || [])];

        this.isLoading = false;

        console.log("FINAL ARRAY", this.transactions);

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.log(err);

        this.isLoading = false;

      }

    });

  }



  onCategoryChange() {

    this.isOtherCategory = this.category === 'Other';

    if (!this.isOtherCategory) {
      this.customCategory = '';
    }

  }
  validateAddForm(): boolean {

    this.amountError = '';
    this.categoryError = '';
    this.dateError = '';

    if (
      this.amount === null ||
      this.amount === undefined ||
      this.amount <= 0
    ) {
      this.amountError = 'Please enter a valid positive amount';
    }

    if (!this.category.trim()) {
      this.categoryError = 'Category is required';
    }

    if (this.category === 'Other' && !this.customCategory.trim()) {
      this.categoryError = 'Please enter a category';
    }

    if (!this.transactionDate) {
      this.dateError = 'Transaction date is required';
    }

    return (
      !this.amountError &&
      !this.categoryError &&
      !this.dateError
    );
  }
  saveTransaction(): void {

    this.isFormSubmitted = true;

    if (!this.validateAddForm()) {
      return;
    }

    this.isFormLoading = true;
    this.errorMessage = '';

    const payload = {

      type: this.transactionType,
      category:
        this.category === 'Other'
          ? this.customCategory.trim()
          : this.category.trim(),
      amount: Number(this.amount),
      date: this.transactionDate

    };

    console.log('POST Payload:', payload);

    this.api.createTransaction(payload).subscribe({

      next: (res: any) => {

        console.log("POST Success:", res);

        this.isFormLoading = false;

        this.resetForm();

        setTimeout(() => {
          this.loadTransactions();
        }, 300);

      },

      error: (err: any) => {

        console.error('POST Error:', err);

        this.isFormLoading = false;

        this.errorMessage =
          err.error?.message || 'Failed to save transaction.';

      }

    });

  }

  resetForm() {

    this.showAddForm = false;

    this.transactionType = 'Income';
    this.category = '';
    this.amount = null;
    this.transactionDate = new Date().toISOString().split('T')[0];

    this.amountError = '';
    this.categoryError = '';
    this.dateError = '';

    this.isFormSubmitted = false;
    this.isFormLoading = false;

  }

  deleteTransaction(id: number) {

    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    this.api.deleteTransaction(id.toString()).subscribe({

      next: () => {

        this.loadTransactions();

      },

      error: (err: any) => {

        console.error(err);

        alert('Failed to delete transaction.');

      }

    });

  }

  formatCurrency(amount: number | undefined | null): string {

    const value = Number(amount ?? 0);

    return '₹' + value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  }

  formatDate(date: string): string {

    if (!date) {
      return '';
    }

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    );

  }

  logout() {

    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');

    this.router.navigate(['/']);

  }

}