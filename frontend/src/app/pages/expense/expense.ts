import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-expense',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './expense.html',
  styleUrl: './expense.css'
})
export class Expense implements OnInit {

  // =========================================================
  // THEME
  // =========================================================

  isLightTheme = false;


  // =========================================================
  // FORM DATA
  // =========================================================

  description = '';

  amount: number | null = null;

  transactionDate = '';

  category = '';

  notes = '';


  // =========================================================
  // VALIDATION
  // =========================================================

  descriptionError = '';

  amountError = '';

  categoryError = '';

  dateError = '';

  errorMessage = '';

  isLoading = false;

  isSubmitted = false;


  // =========================================================
  // CATEGORY / AUTO CATEGORIZATION
  // =========================================================

  autoCategorizeEnabled = true;

  categoryMappings: any[] = [];

  isAutoSuggested = false;

  expenseCategories: any[] = [];


  // =========================================================
  // DEFAULT AUTO CATEGORY MAPPINGS
  // =========================================================

  defaultMappings = [

    {
      keyword: 'adobe',
      category: 'Software/SaaS'
    },

    {
      keyword: 'figma',
      category: 'Software/SaaS'
    },

    {
      keyword: 'aws',
      category: 'Software/SaaS'
    },

    {
      keyword: 'github',
      category: 'Software/SaaS'
    },

    {
      keyword: 'slack',
      category: 'Software/SaaS'
    },

    {
      keyword: 'uber',
      category: 'Travel/Meals'
    },

    {
      keyword: 'taxi',
      category: 'Travel/Meals'
    },

    {
      keyword: 'hotel',
      category: 'Travel/Meals'
    },

    {
      keyword: 'food',
      category: 'Travel/Meals'
    },

    {
      keyword: 'meals',
      category: 'Travel/Meals'
    },

    {
      keyword: 'ads',
      category: 'Marketing/Ads'
    },

    {
      keyword: 'facebook',
      category: 'Marketing/Ads'
    },

    {
      keyword: 'google',
      category: 'Marketing/Ads'
    },

    {
      keyword: 'marketing',
      category: 'Marketing/Ads'
    },

    {
      keyword: 'macbook',
      category: 'Hardware/Gadgets'
    },

    {
      keyword: 'laptop',
      category: 'Hardware/Gadgets'
    },

    {
      keyword: 'monitor',
      category: 'Hardware/Gadgets'
    },

    {
      keyword: 'phone',
      category: 'Hardware/Gadgets'
    },

    {
      keyword: 'paper',
      category: 'Office Supplies'
    },

    {
      keyword: 'notebook',
      category: 'Office Supplies'
    },

    {
      keyword: 'pen',
      category: 'Office Supplies'
    },

    {
      keyword: 'office',
      category: 'Office Supplies'
    }

  ];


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private api: ApiService,
    private router: Router
  ) {}


  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit() {

    console.log(
      '🔥 EXPENSE COMPONENT LOADED'
    );

    this.initializeTheme();

    this.setTodayDate();

    this.loadSettings();

    this.loadExpenseCategories();

  }


  // =========================================================
  // THEME
  // =========================================================

  initializeTheme() {

    const savedTheme =
      localStorage.getItem('theme');


    if (savedTheme === 'light') {

      this.isLightTheme = true;

      document.body.classList.add(
        'light-theme'
      );

    } else {

      this.isLightTheme = false;

      document.body.classList.remove(
        'light-theme'
      );

    }

  }


  toggleTheme() {

    this.isLightTheme =
      !this.isLightTheme;


    if (this.isLightTheme) {

      document.body.classList.add(
        'light-theme'
      );

      localStorage.setItem(
        'theme',
        'light'
      );

    } else {

      document.body.classList.remove(
        'light-theme'
      );

      localStorage.setItem(
        'theme',
        'dark'
      );

    }

  }


  // =========================================================
  // DATE
  // =========================================================

  setTodayDate() {

    const today = new Date();


    const yyyy =
      today.getFullYear();


    const mm =
      String(today.getMonth() + 1)
        .padStart(2, '0');


    const dd =
      String(today.getDate())
        .padStart(2, '0');


    this.transactionDate =
      `${yyyy}-${mm}-${dd}`;

  }


  // =========================================================
  // LOAD EXPENSE CATEGORIES
  // =========================================================

loadExpenseCategories() {

  console.log('🔍 Loading categories from API for EXPENSE...');

  this.api.getCategories().subscribe({

    next: (res: any) => {

      console.log('🔍 CATEGORY API RESPONSE:', res);

      if (!res || !Array.isArray(res.categories)) {

        console.error(
          '❌ Invalid category API response:',
          res
        );

        this.expenseCategories = [];
        this.category = '';

        return;
      }

      const categories = res.categories;

      console.log(
        '🔍 ALL CATEGORIES:',
        categories
      );

      this.expenseCategories =
        categories.filter(
          (cat: any) =>
            String(cat.type).toLowerCase() === 'expense'
        );

      console.log(
        '🔍 EXPENSE CATEGORIES:',
        this.expenseCategories
      );

      if (this.expenseCategories.length > 0) {

        this.setDefaultCategory();

      } else {

        this.category = '';

        console.warn(
          '⚠️ No expense categories found.'
        );

      }

    },

    error: (err: any) => {

      console.error(
        '❌ CATEGORY API ERROR:',
        err
      );

      this.expenseCategories = [];
      this.category = '';

      this.errorMessage =
        'Unable to load expense categories. Please refresh the page.';

    }

  });

}

  // =========================================================
  // DEFAULT CATEGORY
  // =========================================================

  setDefaultCategory() {

    if (
      this.expenseCategories.length > 0
    ) {

      this.category =
        this.expenseCategories[0].name;

    } else {

      this.category = '';

    }

  }


  // =========================================================
  // LOAD SETTINGS
  // =========================================================

  loadSettings() {

    const userStr =
      localStorage.getItem('user');


    if (userStr) {

      try {

        const user =
          JSON.parse(userStr);


        this.autoCategorizeEnabled =
          user.autoCategorizeEnabled !== false;


        this.categoryMappings =
          user.categoryMappings?.length
            ? user.categoryMappings
            : this.defaultMappings;


      } catch (e) {

        console.error(
          'Error reading user settings:',
          e
        );


        this.autoCategorizeEnabled = true;

        this.categoryMappings =
          this.defaultMappings;

      }

    } else {

      this.autoCategorizeEnabled = true;

      this.categoryMappings =
        this.defaultMappings;

    }


    this.api.getBudgets().subscribe({

      next: (res: any) => {

        if (
          res &&
          res.data &&
          res.data.settings
        ) {

          const settings =
            res.data.settings;


          this.autoCategorizeEnabled =
            settings.autoCategorizeEnabled !== false;


          if (
            settings.categoryMappings &&
            settings.categoryMappings.length > 0
          ) {

            this.categoryMappings =
              settings.categoryMappings;

          }

        }

      },

      error: (err: any) => {

        console.error(
          'Error fetching budgets/settings:',
          err
        );

      }

    });

  }


  // =========================================================
  // AUTO CATEGORY
  // =========================================================

  onDescriptionInput() {

    if (!this.autoCategorizeEnabled) {

      return;

    }


    const desc =
      this.description.toLowerCase();


    if (!desc.trim()) {

      this.isAutoSuggested = false;

      return;

    }


    const match =
      this.categoryMappings.find(
        (mapping: any) =>
          desc.includes(
            String(mapping.keyword)
              .toLowerCase()
          )
      );


    if (match) {

      const matchingCategory =
        this.expenseCategories.find(
          (cat: any) =>
            cat.name === match.category
        );


      if (matchingCategory) {

        this.category =
          matchingCategory.name;

        this.isAutoSuggested = true;

      } else {

        this.isAutoSuggested = false;

      }

    } else {

      this.isAutoSuggested = false;

    }

  }


  onCategoryChange() {

    this.isAutoSuggested = false;

  }


  // =========================================================
  // VALIDATION
  // =========================================================

  validateForm(): boolean {

    this.descriptionError = '';

    this.amountError = '';

    this.categoryError = '';

    this.dateError = '';


    if (!this.description.trim()) {

      this.descriptionError =
        'Description is required';

    }


    if (
      this.amount === null ||
      this.amount === undefined ||
      this.amount <= 0
    ) {

      this.amountError =
        'Please enter a valid positive amount';

    }


    if (!this.category.trim()) {

      this.categoryError =
        'Category is required';

    }


    if (!this.transactionDate) {

      this.dateError =
        'Transaction date is required';

    }


    return (
      !this.descriptionError &&
      !this.amountError &&
      !this.categoryError &&
      !this.dateError
    );

  }


  // =========================================================
  // SAVE EXPENSE
  // =========================================================

  saveExpense() {

    this.isSubmitted = true;


    if (!this.validateForm()) {

      return;

    }


    this.isLoading = true;

    this.errorMessage = '';


    const payload = {

      type: 'Expense',

      description:
        this.description.trim(),

      category:
        this.category,

      amount:
        Number(this.amount),

      transactionDate:
        this.transactionDate,

      notes:
        this.notes.trim() || undefined

    };


    console.log(
      '🔥 SAVING EXPENSE:',
      payload
    );


    this.api
      .createTransaction(payload)
      .subscribe({

        next: () => {

          this.isLoading = false;

          this.router.navigate([
            '/dashboard'
          ]);

        },

        error: (err: any) => {

          this.isLoading = false;

          console.error(
            '❌ Error saving expense:',
            err
          );


          if (
            err?.error?.message
          ) {

            this.errorMessage =
              err.error.message;

          } else {

            this.errorMessage =
              'Failed to save expense. Please try again.';

          }

        }

      });

  }

}