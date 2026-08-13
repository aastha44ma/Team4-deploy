import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-income',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './income.html',
  styleUrl: './income.css'
})
export class Income implements OnInit {

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

  incomeCategories: any[] = [];


  // =========================================================
  // DEFAULT AUTO CATEGORY MAPPINGS
  // =========================================================

  defaultMappings = [
    {
      keyword: 'project',
      category: 'Freelance Project'
    },
    {
      keyword: 'website',
      category: 'Freelance Project'
    },
    {
      keyword: 'freelance',
      category: 'Freelance Project'
    },
    {
      keyword: 'retainer',
      category: 'Contract Work'
    },
    {
      keyword: 'contract',
      category: 'Contract Work'
    },
    {
      keyword: 'consulting',
      category: 'Consulting'
    },
    {
      keyword: 'consult',
      category: 'Consulting'
    },
    {
      keyword: 'advisory',
      category: 'Consulting'
    },
    {
      keyword: 'royalty',
      category: 'Royalties'
    },
    {
      keyword: 'royalties',
      category: 'Royalties'
    },
    {
      keyword: 'book',
      category: 'Royalties'
    },
    {
      keyword: 'course',
      category: 'Royalties'
    },
    {
      keyword: 'youtube',
      category: 'Ad Revenue'
    },
    {
      keyword: 'ad',
      category: 'Ad Revenue'
    },
    {
      keyword: 'ads',
      category: 'Ad Revenue'
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

    console.log('🔥 INCOME COMPONENT LOADED');

    this.initializeTheme();

    this.setTodayDate();

    this.loadSettings();

    this.loadIncomeCategories();

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
  // LOAD INCOME CATEGORIES
  // =========================================================

loadIncomeCategories() {

  console.log('🔍 Loading categories from API for INCOME...');

  this.api.getCategories().subscribe({

    next: (res: any) => {

      console.log('🔍 CATEGORY API RESPONSE:', res);

      if (!res || !Array.isArray(res.categories)) {

        console.error(
          '❌ Invalid category API response:',
          res
        );

        this.incomeCategories = [];
        this.category = '';

        return;
      }

      const categories = res.categories;

      console.log(
        '🔍 ALL CATEGORIES:',
        categories
      );

      this.incomeCategories =
        categories.filter(
          (cat: any) =>
            String(cat.type).toLowerCase() === 'income'
        );

      console.log(
        '🔍 INCOME CATEGORIES:',
        this.incomeCategories
      );

      if (this.incomeCategories.length > 0) {

        this.setDefaultCategory();

      } else {

        this.category = '';

        console.warn(
          '⚠️ No income categories found.'
        );

      }

    },

    error: (err: any) => {

      console.error(
        '❌ CATEGORY API ERROR:',
        err
      );

      this.incomeCategories = [];
      this.category = '';

      this.errorMessage =
        'Unable to load income categories. Please refresh the page.';

    }

  });

}


  // =========================================================
  // DEFAULT CATEGORY
  // =========================================================

  setDefaultCategory() {

    if (
      this.incomeCategories.length > 0
    ) {

      this.category =
        this.incomeCategories[0].name;

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


    // Keep existing settings logic.
    // This is independent of category loading.

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
        this.incomeCategories.find(
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
  // SAVE INCOME
  // =========================================================

  saveIncome() {

    this.isSubmitted = true;


    if (!this.validateForm()) {

      return;

    }


    this.isLoading = true;

    this.errorMessage = '';


    const payload = {

      type: 'Income',

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
      '🔥 SAVING INCOME:',
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
            '❌ Error saving income:',
            err
          );


          if (
            err?.error?.message
          ) {

            this.errorMessage =
              err.error.message;

          } else {

            this.errorMessage =
              'Failed to save income. Please try again.';

          }

        }

      });

  }

}