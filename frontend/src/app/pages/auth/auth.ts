import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  NavigationEnd,
  Router
} from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class Auth {

  // =========================================================
  // MODE
  // =========================================================

  isLogin = true;


  // =========================================================
  // PASSWORD VISIBILITY
  // =========================================================

  showPassword = false;
  showConfirmPassword = false;


  // =========================================================
  // FORGOT PASSWORD
  // =========================================================

  showForgotPassword = false;
  forgotEmail = '';


  // =========================================================
  // TOAST
  // =========================================================

  showToast = false;

  toastMessage = '';

  toastType: 'success' | 'error' = 'success';


  // =========================================================
  // FORM
  // =========================================================

  authForm;


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {

    // =======================================================
    // CREATE FORM
    // =======================================================

    this.authForm = this.formBuilder.group({

      name: [
        ''
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      country: [
        ''
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8)
        ]
      ],

      confirmPassword: [
        ''
      ],

      terms: [
        false
      ]

    });


    // =======================================================
    // INITIAL MODE
    // =======================================================

    this.updateMode();

    this.updateValidators();


    // =======================================================
    // ROUTE CHANGE
    // =======================================================

    this.router.events
      .pipe(
        filter(
          event => event instanceof NavigationEnd
        )
      )
      .subscribe(() => {

        this.updateMode();

        this.resetForm();

        this.updateValidators();

      });

  }


  // =========================================================
  // UPDATE LOGIN / REGISTER MODE
  // =========================================================

  private updateMode(): void {

    this.isLogin =
      this.router.url === '/login';

  }


  // =========================================================
  // UPDATE VALIDATORS
  // =========================================================

  private updateValidators(): void {

    const nameControl =
      this.authForm.controls.name;

    const countryControl =
      this.authForm.controls.country;

    const confirmPasswordControl =
      this.authForm.controls.confirmPassword;

    const termsControl =
      this.authForm.controls.terms;


    // =======================================================
    // LOGIN
    // =======================================================

    if (this.isLogin) {

      nameControl.clearValidators();

      countryControl.clearValidators();

      confirmPasswordControl.clearValidators();

      termsControl.clearValidators();

    }

    // =======================================================
    // REGISTER
    // =======================================================

    else {

      nameControl.setValidators(
        Validators.required
      );

      countryControl.setValidators(
        Validators.required
      );

      confirmPasswordControl.setValidators(
        Validators.required
      );

      termsControl.setValidators(
        Validators.requiredTrue
      );

    }


    // =======================================================
    // UPDATE VALIDITY
    // =======================================================

    nameControl.updateValueAndValidity();

    countryControl.updateValueAndValidity();

    confirmPasswordControl.updateValueAndValidity();

    termsControl.updateValueAndValidity();

  }


  // =========================================================
  // RESET FORM
  // =========================================================

  private resetForm(): void {

    this.authForm.reset({

      name: '',

      email: '',

      country: '',

      password: '',

      confirmPassword: '',

      terms: false

    });


    this.showPassword = false;

    this.showConfirmPassword = false;

    this.showForgotPassword = false;

    this.forgotEmail = '';

  }


  // =========================================================
  // SWITCH LOGIN / REGISTER
  // =========================================================

  switchMode(): void {

    this.closeForgotPassword();

    this.hideToast();


    // =======================================================
    // LOGIN → REGISTER
    // =======================================================

    if (this.isLogin) {

      this.router.navigate([
        '/register'
      ]);

    }

    // =======================================================
    // REGISTER → LOGIN
    // =======================================================

    else {

      this.router.navigate([
        '/login'
      ]);

    }

  }


  // =========================================================
  // PASSWORD VISIBILITY
  // =========================================================

  togglePassword(): void {

    this.showPassword =
      !this.showPassword;

  }


  // =========================================================
  // CONFIRM PASSWORD VISIBILITY
  // =========================================================

  toggleConfirmPassword(): void {

    this.showConfirmPassword =
      !this.showConfirmPassword;

  }


  // =========================================================
  // FORGOT PASSWORD - OPEN
  // =========================================================

  openForgotPassword(): void {

    this.showForgotPassword = true;

    this.forgotEmail =
      this.authForm.controls.email.value || '';

  }


  // =========================================================
  // FORGOT PASSWORD - CLOSE
  // =========================================================

  closeForgotPassword(): void {

    this.showForgotPassword = false;

    this.forgotEmail = '';

  }


  // =========================================================
  // SEND RESET LINK
  // =========================================================

  sendResetLink(): void {

    const email =
      this.forgotEmail.trim();


    // =======================================================
    // VALIDATE EMAIL
    // =======================================================

    if (
      !email ||
      !this.isValidEmail(email)
    ) {

      this.showToastMessage(

        'Please enter a valid email address.',

        'error'

      );

      return;

    }


    // =======================================================
    // DEMO RESET REQUEST
    // =======================================================

    console.log(
      'Password reset requested for:',
      email
    );


    // =======================================================
    // CLOSE FORGOT PASSWORD BOX
    // =======================================================

    this.closeForgotPassword();


    // =======================================================
    // SUCCESS TOAST
    // =======================================================

    this.showToastMessage(

      'Password reset link sent to your registered email.',

      'success'

    );

  }


  // =========================================================
  // EMAIL VALIDATION
  // =========================================================

  private isValidEmail(
    email: string
  ): boolean {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    );

  }


  // =========================================================
  // SUBMIT
  // =========================================================

  onSubmit(): void {

    // =======================================================
    // FORM VALIDATION
    // =======================================================

    if (this.authForm.invalid) {

      this.authForm.markAllAsTouched();


      this.showToastMessage(

        'Please complete all required fields.',

        'error'

      );


      return;

    }


    // =======================================================
    // REGISTER
    // =======================================================

    if (!this.isLogin) {

      const password =
        this.authForm.controls.password.value;

      const confirmPassword =
        this.authForm.controls.confirmPassword.value;


      // =====================================================
      // PASSWORD MATCH CHECK
      // =====================================================

      if (
        password !== confirmPassword
      ) {

        this.authForm.controls.confirmPassword.setErrors({

          passwordMismatch: true

        });


        this.authForm.controls.confirmPassword.markAsTouched();


        this.showToastMessage(

          'Passwords do not match.',

          'error'

        );


        return;

      }


      // =====================================================
      // REGISTRATION SUBMITTED
      // =====================================================

      console.log(

        'Registration form submitted:',

        this.authForm.value

      );


      // =====================================================
      // REGISTRATION SUCCESS TOAST
      // =====================================================

      this.showToastMessage(

        'Registration successful! Redirecting to login...',

        'success'

      );


      // =====================================================
      // REDIRECT TO LOGIN
      // =====================================================

      setTimeout(() => {

        this.router.navigate([
          '/login'
        ]);

      }, 1800);


      return;

    }


    // =======================================================
    // LOGIN
    // =======================================================

    console.log(

      'Login form submitted:',

      this.authForm.value

    );


    // =======================================================
    // LOGIN SUCCESS TOAST
    // =======================================================

    this.showToastMessage(

      'Login successful! Welcome back to TaxPal.',

      'success'

    );

  }


  // =========================================================
  // SHOW TOAST
  // =========================================================

  private showToastMessage(

    message: string,

    type: 'success' | 'error'

  ): void {

    this.toastMessage = message;

    this.toastType = type;

    this.showToast = true;


    // =======================================================
    // AUTO HIDE AFTER 3.5 SECONDS
    // =======================================================

    setTimeout(() => {

      this.hideToast();

    }, 3500);

  }


  // =========================================================
  // HIDE TOAST
  // =========================================================

  hideToast(): void {

    this.showToast = false;

  }

}