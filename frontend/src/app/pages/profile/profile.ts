import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  // =========================================================
  // GENERAL
  // =========================================================

  activeTab = 'profile';

  isLightTheme = false;

// Profile-specific loading
isProfileSaving = false;

// Password-specific loading
isPasswordSaving = false;

  errorMessage = '';

  successMessage = '';


  // =========================================================
  // PROFILE DATA
  // =========================================================

  fullName = '';

  email = '';

  country = '';

  incomeBracket = '';


  // =========================================================
  // PASSWORD
  // =========================================================

  currentPassword = '';

  newPassword = '';

  confirmPassword = '';


  // =========================================================
  // CATEGORIES
  // =========================================================

  expenseCategories: any[] = [];

  incomeCategories: any[] = [];

  newExpenseCategory = '';

  newIncomeCategory = '';


  // =========================================================
  // NOTIFICATION SETTINGS
  // =========================================================

  emailNotifications = true;

  budgetAlerts = true;

  weeklyReports = false;


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit() {

    this.initializeTheme();

    this.loadUserProfile();

    this.loadCategories();

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
  // LOAD PROFILE FROM BACKEND
  // =========================================================

  loadUserProfile() {

    this.api.getProfile().subscribe({

      next: (user: any) => {

        console.log(
          'Profile loaded:',
          user
        );

        this.fullName =
          user.name || '';

        this.email =
          user.email || '';

        this.country =
          user.country || '';

        this.incomeBracket =
          user.incomeBracket || '';


        // Keep localStorage synchronized
        this.api.saveUser(user);

        this.cdr.detectChanges();

      },

      error: (err: any) => {

        console.error(
          'Failed to load profile:',
          err
        );


        // Fallback to localStorage
        const userStr =
          localStorage.getItem('user');


        if (userStr) {

          try {

            const user =
              JSON.parse(userStr);


            this.fullName =
              user.name ||
              user.fullName ||
              '';

            this.email =
              user.email ||
              '';

            this.country =
              user.country ||
              '';

            this.incomeBracket =
              user.incomeBracket ||
              '';


            this.cdr.detectChanges();

          } catch (error) {

            console.error(
              'Error parsing stored user:',
              error
            );

          }

        }

      }

    });

  }


  // =========================================================
  // UPDATE PROFILE
  // =========================================================

  updateProfile() {

    // Validate name
    if (!this.fullName.trim()) {

      this.errorMessage =
        'Full name is required';

      this.successMessage = '';

      return;

    }


    // Validate email
    if (!this.email.trim()) {

      this.errorMessage =
        'Email is required';

      this.successMessage = '';

      return;

    }


    this.isProfileSaving = true;

    this.errorMessage = '';

    this.successMessage = '';


    const payload = {

      name:
        this.fullName.trim(),

      email:
        this.email.trim(),

      country:
        this.country.trim(),

      incomeBracket:
        this.incomeBracket.trim()

    };


    console.log(
      'Updating profile:',
      payload
    );


    this.api
      .updateProfile(payload)
      .subscribe({

        // =====================================================
        // SUCCESS
        // =====================================================

        next: (res: any) => {

          console.log(
            'Profile updated:',
            res
          );


          this.isProfileSaving = false;


          this.successMessage =
            res?.message ||
            'Profile updated successfully';


          this.errorMessage = '';


          // Backend returned updated user
          if (res?.user) {

            this.api.saveUser(
              res.user
            );


            this.fullName =
              res.user.name || '';

            this.email =
              res.user.email || '';

            this.country =
              res.user.country || '';

            this.incomeBracket =
              res.user.incomeBracket || '';

          }

          // Backend did not return user
          else {

            const user =
              this.api.getUser();


            if (user) {

              user.name =
                this.fullName.trim();

              user.email =
                this.email.trim();

              user.country =
                this.country.trim();

              user.incomeBracket =
                this.incomeBracket.trim();


              this.api.saveUser(user);

            }

          }


          this.cdr.detectChanges();

        },


        // =====================================================
        // ERROR
        // =====================================================

        error: (err: any) => {

          console.error(
            'Update profile error:',
            err
          );


          this.isProfileSaving = false;


          this.errorMessage =
            err?.error?.message ||
            'Failed to update profile. Please try again.';


          this.successMessage = '';


          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  changePassword() {

    // Validate fields
    if (
      !this.currentPassword ||
      !this.newPassword ||
      !this.confirmPassword
    ) {

      this.errorMessage =
        'All password fields are required';

      this.successMessage = '';

      return;

    }


    // Confirm password
    if (
      this.newPassword !==
      this.confirmPassword
    ) {

      this.errorMessage =
        'New passwords do not match';

      this.successMessage = '';

      return;

    }


    // Minimum password length
    if (
      this.newPassword.length < 6
    ) {

      this.errorMessage =
        'Password must be at least 6 characters';

      this.successMessage = '';

      return;

    }


   this.isPasswordSaving = true;

    this.errorMessage = '';

    this.successMessage = '';


    const payload = {

      currentPassword:
        this.currentPassword,

      newPassword:
        this.newPassword

    };


    console.log(
      'Changing password...'
    );


    this.api
      .changePassword(payload)
      .subscribe({

        // ===================================================
        // SUCCESS
        // ===================================================

        next: (res: any) => {

          console.log(
            'Password changed:',
            res
          );


          this.isPasswordSaving = false;


          this.successMessage =
            res?.message ||
            'Password changed successfully';


          this.errorMessage = '';


          // Clear password fields
          this.currentPassword = '';

          this.newPassword = '';

          this.confirmPassword = '';


          this.cdr.detectChanges();

        },


        // ===================================================
        // ERROR
        // ===================================================

        error: (err: any) => {

          console.error(
            'Change password error:',
            err
          );


          this.isPasswordSaving = false;


          this.errorMessage =
            err?.error?.message ||
            'Failed to change password. Please check your current password.';


          this.successMessage = '';


          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // TAB MANAGEMENT
  // =========================================================

  setTab(tab: string) {

    this.activeTab = tab;

    this.errorMessage = '';

    this.successMessage = '';

  }


  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  loadCategories() {

    console.log(
      '🔥 Loading categories from API...'
    );


    this.api
      .getCategories()
      .subscribe({

        // ===================================================
        // SUCCESS
        // ===================================================

        next: (res: any) => {

          console.log(
            '🔥 CATEGORY API RESPONSE:',
            res
          );


          if (
            !res ||
            !Array.isArray(res.categories)
          ) {

            console.error(
              '❌ Invalid category API response:',
              res
            );


            this.expenseCategories = [];

            this.incomeCategories = [];

            return;

          }


          const categories =
            res.categories;


          console.log(
            '🔥 ALL CATEGORIES:',
            categories
          );


          // Expense categories
          this.expenseCategories =
            categories.filter(
              (category: any) =>
                String(
                  category.type
                ).toLowerCase() ===
                'expense'
            );


          // Income categories
          this.incomeCategories =
            categories.filter(
              (category: any) =>
                String(
                  category.type
                ).toLowerCase() ===
                'income'
            );


          console.log(
            '🔥 EXPENSE CATEGORIES:',
            this.expenseCategories
          );


          console.log(
            '🔥 INCOME CATEGORIES:',
            this.incomeCategories
          );


          this.cdr.detectChanges();

        },


        // ===================================================
        // ERROR
        // ===================================================

        error: (err: any) => {

          console.error(
            '❌ CATEGORY API ERROR:',
            err
          );


          this.expenseCategories = [];

          this.incomeCategories = [];

        }

      });

  }


  // =========================================================
  // INITIALIZE DEFAULT CATEGORIES
  // =========================================================

  initializeDefaultCategories() {

    this.api
      .initializeDefaultCategories()
      .subscribe({

        next: () => {

          this.successMessage =
            'Default categories initialized';


          this.errorMessage = '';


          this.loadCategories();

        },

        error: (err: any) => {

          console.error(
            'Error initializing categories:',
            err
          );


          this.errorMessage =
            err?.error?.message ||
            'Failed to initialize default categories';


          this.successMessage = '';

        }

      });

  }


  // =========================================================
  // ADD EXPENSE CATEGORY
  // =========================================================

  addExpenseCategory() {

    const name =
      this.newExpenseCategory.trim();


    if (!name) {

      return;

    }


    // Check duplicate
    if (
      this.expenseCategories.some(
        (category: any) =>
          String(
            category.name
          ).toLowerCase() ===
          name.toLowerCase()
      )
    ) {

      this.errorMessage =
        'Category already exists';

      this.successMessage = '';

      return;

    }


    this.api
      .createCategory({

        name,

        type: 'expense',

        color: '#6366f1',

        icon: 'tag'

      })
      .subscribe({

        next: (res: any) => {

          console.log(
            'Expense category created:',
            res
          );


          if (res?.category) {

            this.expenseCategories = [

              ...this.expenseCategories,

              res.category

            ];

          }


          this.newExpenseCategory = '';


          this.successMessage =
            'Category added successfully';


          this.errorMessage = '';


          this.cdr.detectChanges();

        },


        error: (err: any) => {

          console.error(
            'Add expense category error:',
            err
          );


          this.errorMessage =
            err?.error?.message ||
            'Failed to add category';


          this.successMessage = '';

        }

      });

  }


  // =========================================================
  // ADD INCOME CATEGORY
  // =========================================================

  addIncomeCategory() {

    const name =
      this.newIncomeCategory.trim();


    if (!name) {

      return;

    }


    // Check duplicate
    if (
      this.incomeCategories.some(
        (category: any) =>
          String(
            category.name
          ).toLowerCase() ===
          name.toLowerCase()
      )
    ) {

      this.errorMessage =
        'Category already exists';

      this.successMessage = '';

      return;

    }


    this.api
      .createCategory({

        name,

        type: 'income',

        color: '#10b981',

        icon: 'tag'

      })
      .subscribe({

        next: (res: any) => {

          console.log(
            'Income category created:',
            res
          );


          if (res?.category) {

            this.incomeCategories = [

              ...this.incomeCategories,

              res.category

            ];

          }


          this.newIncomeCategory = '';


          this.successMessage =
            'Category added successfully';


          this.errorMessage = '';


          this.cdr.detectChanges();

        },


        error: (err: any) => {

          console.error(
            'Add income category error:',
            err
          );


          this.errorMessage =
            err?.error?.message ||
            'Failed to add category';


          this.successMessage = '';

        }

      });

  }


  // =========================================================
  // DELETE EXPENSE CATEGORY
  // =========================================================

  removeExpenseCategory(
    category: any
  ) {

    if (
      this.expenseCategories.length <= 1
    ) {

      this.errorMessage =
        'Cannot remove the last category';

      return;

    }


    if (category.isDefault) {

      this.errorMessage =
        'Cannot remove default categories';

      return;

    }


    const categoryId =
      category._id ||
      category.id;


    if (!categoryId) {

      this.errorMessage =
        'Invalid category';

      return;

    }


    this.api
      .deleteCategory(
        String(categoryId)
      )
      .subscribe({

        next: () => {

          console.log(
            'Expense category deleted:',
            categoryId
          );


          this.expenseCategories =
            this.expenseCategories.filter(
              (item: any) =>
                String(
                  item._id ||
                  item.id
                ) !==
                String(categoryId)
            );


          this.successMessage =
            'Category removed successfully';


          this.errorMessage = '';


          this.cdr.detectChanges();

        },


        error: (err: any) => {

          console.error(
            'Delete expense category error:',
            err
          );


          this.errorMessage =
            err?.error?.message ||
            'Failed to remove category';


          this.successMessage = '';

        }

      });

  }


  // =========================================================
  // DELETE INCOME CATEGORY
  // =========================================================

  removeIncomeCategory(
    category: any
  ) {

    if (
      this.incomeCategories.length <= 1
    ) {

      this.errorMessage =
        'Cannot remove the last category';

      return;

    }


    if (category.isDefault) {

      this.errorMessage =
        'Cannot remove default categories';

      return;

    }


    const categoryId =
      category._id ||
      category.id;


    if (!categoryId) {

      this.errorMessage =
        'Invalid category';

      return;

    }


    this.api
      .deleteCategory(
        String(categoryId)
      )
      .subscribe({

        next: () => {

          console.log(
            'Income category deleted:',
            categoryId
          );


          this.incomeCategories =
            this.incomeCategories.filter(
              (item: any) =>
                String(
                  item._id ||
                  item.id
                ) !==
                String(categoryId)
            );


          this.successMessage =
            'Category removed successfully';


          this.errorMessage = '';


          this.cdr.detectChanges();

        },


        error: (err: any) => {

          console.error(
            'Delete income category error:',
            err
          );


          this.errorMessage =
            err?.error?.message ||
            'Failed to remove category';


          this.successMessage = '';

        }

      });

  }


  // =========================================================
  // NOTIFICATION SETTINGS
  // =========================================================

  saveNotificationSettings() {

    const payload = {

      emailNotifications:
        this.emailNotifications,

      budgetAlerts:
        this.budgetAlerts,

      weeklyReports:
        this.weeklyReports

    };


    /*
     * Notification fields are currently
     * not present in the Prisma User model.
     *
     * Therefore we don't send them to
     * updateProfile() because the backend
     * does not support these fields yet.
     */

    console.log(
      'Notification settings:',
      payload
    );


    this.successMessage =
      'Notification settings saved locally';

    this.errorMessage = '';

  }


  // =========================================================
  // LOGOUT
  // =========================================================

  logout() {

    this.api.logout();

    this.router.navigate([
      '/login'
    ]);

  }

}