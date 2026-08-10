import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ApiService } from '../../services/api';

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


  // MODE
  isLogin = true;


  // PASSWORD
  showPassword = false;
  showConfirmPassword = false;


  // FORGOT PASSWORD
  showForgotPassword = false;
  forgotEmail = '';



  // TOAST
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';



  // FORM
  authForm;



  constructor(

    private formBuilder: FormBuilder,

    private router: Router,

    private apiService: ApiService

  ) {


    this.authForm = this.formBuilder.group({


      name: [''],


      email: [

        '',

        [

          Validators.required,

          Validators.email

        ]

      ],


      country: [''],


      incomeBracket: [''],


      password: [

        '',

        [

          Validators.required,

          Validators.minLength(8)

        ]

      ],


      confirmPassword: [''],


      terms: [false]


    });



    this.updateMode();

    this.updateValidators();



    this.router.events

      .pipe(

        filter(

          event => event instanceof NavigationEnd

        )

      )

      .subscribe(()=>{


        this.updateMode();

        this.resetForm();

        this.updateValidators();


      });


  }




  private updateMode(): void {


    this.isLogin =

      this.router.url === '/login';


  }





  private updateValidators(): void {


    const nameControl =
      this.authForm.controls.name;


    const countryControl =
      this.authForm.controls.country;


    const incomeBracketControl =
      this.authForm.controls.incomeBracket;


    const confirmPasswordControl =
      this.authForm.controls.confirmPassword;


    const termsControl =
      this.authForm.controls.terms;



    if(this.isLogin){


      nameControl.clearValidators();

      countryControl.clearValidators();

      incomeBracketControl.clearValidators();

      confirmPasswordControl.clearValidators();

      termsControl.clearValidators();


    }

    else{


      nameControl.setValidators(
        Validators.required
      );


      countryControl.setValidators(
        Validators.required
      );


      incomeBracketControl.setValidators(
        Validators.required
      );


      confirmPasswordControl.setValidators(
        Validators.required
      );


      termsControl.setValidators(
        Validators.requiredTrue
      );


    }



    nameControl.updateValueAndValidity();

    countryControl.updateValueAndValidity();

    incomeBracketControl.updateValueAndValidity();

    confirmPasswordControl.updateValueAndValidity();

    termsControl.updateValueAndValidity();


  }
    private resetForm(): void {


    this.authForm.reset({

      name: '',

      email: '',

      country: '',

      incomeBracket: '',

      password: '',

      confirmPassword: '',

      terms: false

    });


    this.showPassword = false;

    this.showConfirmPassword = false;

    this.showForgotPassword = false;

    this.forgotEmail = '';


  }





  switchMode(): void {


    this.closeForgotPassword();

    this.hideToast();



    if(this.isLogin){


      this.router.navigate([

        '/register'

      ]);


    }

    else{


      this.router.navigate([

        '/login'

      ]);


    }


  }





  togglePassword(): void {


    this.showPassword =

      !this.showPassword;


  }





  toggleConfirmPassword(): void {


    this.showConfirmPassword =

      !this.showConfirmPassword;


  }





  openForgotPassword(): void {


    this.showForgotPassword = true;


    this.forgotEmail =

      this.authForm.controls.email.value || '';


  }





  closeForgotPassword(): void {


    this.showForgotPassword = false;


    this.forgotEmail = '';


  }





  sendResetLink(): void {


    const email =

      this.forgotEmail.trim();



    if(

      !email ||

      !this.isValidEmail(email)

    ){


      this.showToastMessage(

        'Please enter a valid email address.',

        'error'

      );


      return;


    }



    console.log(

      'Reset password request:',

      email

    );



    this.closeForgotPassword();



    this.showToastMessage(

      'Password reset link sent to your email.',

      'success'

    );


  }





  private isValidEmail(

    email:string

  ):boolean{


    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(

      email

    );


  }





  onSubmit(): void {



    if(this.authForm.invalid){


      this.authForm.markAllAsTouched();



      this.showToastMessage(

        'Please complete all required fields.',

        'error'

      );


      return;


    }





    // REGISTER

    if(!this.isLogin){



      const password =

        this.authForm.controls.password.value;



      const confirmPassword =

        this.authForm.controls.confirmPassword.value;




      if(password !== confirmPassword){



        this.authForm.controls.confirmPassword.setErrors({

          passwordMismatch:true

        });



        this.showToastMessage(

          'Passwords do not match.',

          'error'

        );


        return;


      }




      const registerData = {


        name:

          this.authForm.controls.name.value,


        email:

          this.authForm.controls.email.value,


        country:

          this.authForm.controls.country.value,


        incomeBracket:

          this.authForm.controls.incomeBracket.value,


        password


      };





      this.apiService.register(registerData)

      .subscribe({



        next:(response:any)=>{


          console.log(

            'Registration success',

            response

          );



          this.showToastMessage(

            'Registration successful. Please login.',

            'success'

          );



          setTimeout(()=>{


            this.router.navigate([

              '/login'

            ]);



          },1500);



        },



        error:(error:any)=>{


          console.log(error);



          this.showToastMessage(

            error?.error?.message ||

            'Registration failed.',

            'error'

          );


        }


      });



      return;


    }
        // LOGIN

    const loginData = {


      email:

        this.authForm.controls.email.value,


      password:

        this.authForm.controls.password.value


    };





    this.apiService.login(loginData)

    .subscribe({



      next:(response:any)=>{


        console.log(

          'Login success',

          response

        );



        const token =

          response.token ||

          response.data?.token;



        const user =

          response.user ||

          response.data?.user;




        if(token){


          this.apiService.saveToken(

            token

          );


        }




        if(user){


          this.apiService.saveUser(

            user

          );


        }





        this.showToastMessage(

          'Login successful! Welcome back to TaxPal.',

          'success'

        );





        setTimeout(()=>{


          this.router.navigate([

            '/dashboard'

          ]);



        },1200);



      },




      error:(error:any)=>{


        console.log(

          'Login error',

          error

        );



        this.showToastMessage(

          error?.error?.message ||

          'Invalid email or password.',

          'error'

        );



      }



    });



  }








  // SHOW TOAST

  private showToastMessage(

    message:string,

    type:'success'|'error'

  ):void{


    this.toastMessage = message;


    this.toastType = type;


    this.showToast = true;





    setTimeout(()=>{


      this.hideToast();



    },3500);



  }







  // HIDE TOAST

  hideToast():void{


    this.showToast = false;


  }



}