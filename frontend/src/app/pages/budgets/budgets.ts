import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './budgets.html',
  styleUrls: ['./budgets.css']
})
export class Budgets implements OnInit {

  budgets: any[] = [];

  isLoading = false;
  errorMessage = '';

  userName = 'Freelancer';
  isLightTheme = false;


  // Edit Budget
  editingCategory = '';
  editingBudgetId: number | null = null;
  editingLimit: number | null = null;
  editingDescription = '';
  isSavingBudget = false;


  // Create Budget
  newCategory = '';
  newBudgetLimit: number | null = null;
  newMonth = '';
  newDescription = '';
  isCreatingBudget = false;


  // Categories
  expenseCategories: string[] = [];
  availableCategories: string[] = [];


  // Month
  selectedViewMonth = '';
  minMonthStr = '';

  showCreateModal = false;


 constructor(
  private api: ApiService,
  private router: Router,
  private cdr: ChangeDetectorRef
) { }



  ngOnInit() {

    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'light') {
      this.isLightTheme = true;
      document.body.classList.add('light-theme');
    }


    const userStr = localStorage.getItem('user');

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userName = user.fullName || user.name || 'Freelancer';
      }
      catch {

      }
    }


    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');


    this.selectedViewMonth = `${year}-${month}`;
    this.minMonthStr = this.selectedViewMonth;
    this.newMonth = this.selectedViewMonth;


    this.loadBudgetsAndSettings();

  }




  toggleTheme() {

    this.isLightTheme = !this.isLightTheme;


    if (this.isLightTheme) {

      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');

    }
    else {

      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');

    }

  }





  loadBudgetsAndSettings() {

    this.isLoading = true;
    this.errorMessage = '';

    this.setDefaultCategories();

    this.fetchBudgets();

  }





  setDefaultCategories() {

    this.expenseCategories = [

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

  }





  fetchBudgets() {


    this.api.getBudgets(this.selectedViewMonth)
      .subscribe({

        next:(res:any)=>{


          this.isLoading = false;


          if(!res || !res.success){

            this.budgets = [];
            return;

          }


          this.budgets = Array.isArray(res.budgets)
            ? res.budgets.sort(
                (a:any,b:any)=>Number(b.limit)-Number(a.limit)
              )
            : [];



          this.availableCategories =
  this.getAvailableCategories();

this.cdr.detectChanges();



        },


        error:(err:any)=>{


          this.isLoading = false;

          this.budgets = [];

          this.errorMessage =
          err?.error?.message ||
          "Failed to load budget data.";


        }


      });


  }





  getAvailableCategories():string[] {


    return this.expenseCategories.filter(category=>{


      const exists = this.budgets.some(
        budget =>
        budget.category.toLowerCase() === category.toLowerCase()
      );


      return !exists;


    });


  }





  openCreateModal(){


    this.availableCategories =
    this.getAvailableCategories();


    this.newCategory='';
    this.newBudgetLimit=null;
    this.newMonth=this.selectedViewMonth;
    this.newDescription='';


    this.showCreateModal=true;


  }




  closeCreateModal(){

    this.showCreateModal=false;

  }




  startEditBudget(
    id:number,
    category:string,
    currentLimit:number
  ){


    this.editingBudgetId=id;
    this.editingCategory=category;
    this.editingLimit=currentLimit;


    const found =
    this.budgets.find(
      b=>b.category===category
    );


    this.editingDescription =
    found?.description || '';


  }





  cancelEditBudget(){

    this.editingBudgetId=null;
    this.editingCategory='';
    this.editingLimit=null;
    this.editingDescription='';

  }





  saveBudgetLimit(){


    if(this.editingLimit===null ||
       this.editingLimit<0){

      return;

    }


    const payload={

      category:this.editingCategory,
      limit:Number(this.editingLimit),
      month:this.selectedViewMonth,
      description:this.editingDescription

    };


    this.isSavingBudget=true;



    this.api.updateBudget(
      this.editingBudgetId!,
      payload
    )
    .subscribe({

      next:()=>{

        this.isSavingBudget=false;
        this.cancelEditBudget();
        this.loadBudgetsAndSettings();

      },


      error:()=>{

        this.isSavingBudget=false;

      }

    });


  }





  deleteBudgetLimit(
    id:number,
    category:string
  ){


    if(confirm(`Remove budget for ${category}?`)){


      this.api.deleteBudget(id)
      .subscribe({

        next:()=>{

          this.loadBudgetsAndSettings();

        }

      });


    }


  }




createNewBudget() {

  if (!this.newCategory ||
      this.newBudgetLimit === null) {

    return;

  }


  const payload = {

    category: this.newCategory,
    limit: Number(this.newBudgetLimit),
    month: this.newMonth,
    description: this.newDescription

  };


  this.isCreatingBudget = true;


  this.api.createBudget(payload)
  .subscribe({

    next: (res:any) => {

      console.log("Budget Created:", res);


      this.isCreatingBudget = false;


      this.showCreateModal = false;


      // clear form
      this.newCategory = '';
      this.newBudgetLimit = null;
      this.newDescription = '';


      // reload budgets
      this.fetchBudgets();


    },


    error: (err:any) => {

      console.error("Create Budget Error:", err);


      this.isCreatingBudget = false;


    },


    complete: () => {

      // safety reset
      this.isCreatingBudget = false;

    }


  });


}

  onViewMonthChange(){

    this.loadBudgetsAndSettings();

  }





  formatMonthDisplay(month:string){


    if(!month) return '';


    const [year,monthNumber]=month.split('-');


    const names=[
      'January','February','March',
      'April','May','June',
      'July','August','September',
      'October','November','December'
    ];


    return `${names[Number(monthNumber)-1]} ${year}`;


  }





  formatCurrency(amount:number){


    return '₹'+
    Number(amount||0)
    .toLocaleString('en-IN',
    {
      minimumFractionDigits:2
    });


  }





  logout(){

    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');

    this.router.navigate(['/']);

  }


}