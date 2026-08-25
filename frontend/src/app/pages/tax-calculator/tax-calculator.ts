import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import {
  TaxCalculationData,
  TaxCalculationResult,
  TaxEstimate,
  TaxService
} from '../../services/tax';

import { Sidebar } from '../../components/sidebar/sidebar';

interface TaxDeductionsViewModel {
  businessExpenses: number;
  retirementContributions: number;
  healthInsurance: number;
  homeOffice: number;
}

interface TaxDueDateViewModel {
  month: number;
  day: number;
  label: string;
  percentage: number;
}

interface TaxCalculationViewModel extends TaxCalculationResult {
  quarter: string;
  annualGrossIncome: number;
  grossIncome: number;
  deductions: TaxDeductionsViewModel;
  estimatedAnnualTax: number;
  estimatedQuarterlyTax: number;
  advanceTaxDueDates: TaxDueDateViewModel[];
}

interface TaxEstimateViewModel extends TaxEstimate {
  quarter: string;
  filingStatus: string;
  annualGrossIncome: number;
  grossIncome: number;
  deductions: TaxDeductionsViewModel;
  estimatedAnnualTax: number;
  estimatedQuarterlyTax: number;
}

@Component({
  selector: 'app-tax-calculator',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Sidebar
  ],
  templateUrl: './tax-calculator.html',
  styleUrl: './tax-calculator.css'
})
export class TaxCalculator implements OnInit, OnDestroy {

  calculationResult: TaxCalculationViewModel | null = null;

  taxEstimates: TaxEstimateViewModel[] = [];

  taxCalendarYear = '';

  taxCalendar: Array<{
  quarter: string;
  title: string;
  dueDate: string;
  percentage: number;
}> = [];

  readonly countries = [
    'India',
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Germany',
    'Singapore',
    'UAE',
    'France',
    'Japan'
  ];

  readonly regionsByCountry: Record<string, string[]> = {
    India: [
      'Andhra Pradesh',
      'Arunachal Pradesh',
      'Assam',
      'Bihar',
      'Chhattisgarh',
      'Goa',
      'Gujarat',
      'Haryana',
      'Himachal Pradesh',
      'Jharkhand',
      'Karnataka',
      'Kerala',
      'Madhya Pradesh',
      'Maharashtra',
      'Manipur',
      'Meghalaya',
      'Mizoram',
      'Nagaland',
      'Odisha',
      'Punjab',
      'Rajasthan',
      'Sikkim',
      'Tamil Nadu',
      'Telangana',
      'Tripura',
      'Uttar Pradesh',
      'Uttarakhand',
      'West Bengal',
      'Andaman and Nicobar Islands',
      'Chandigarh',
      'Dadra and Nagar Haveli and Daman and Diu',
      'Delhi',
      'Jammu and Kashmir',
      'Ladakh',
      'Lakshadweep',
      'Puducherry'
    ],

    'United States': [
      'California',
      'Texas',
      'Florida',
      'New York',
      'Illinois',
      'Washington',
      'Pennsylvania',
      'Ohio',
      'Georgia',
      'North Carolina'
    ],

    Canada: [
      'Ontario',
      'British Columbia',
      'Alberta',
      'Quebec',
      'Nova Scotia',
      'Manitoba',
      'Saskatchewan'
    ],

    'United Kingdom': [
      'England',
      'Scotland',
      'Wales',
      'Northern Ireland'
    ],

    Australia: [
      'New South Wales',
      'Victoria',
      'Queensland',
      'Western Australia',
      'South Australia',
      'Tasmania'
    ],

    Germany: [
      'Bavaria',
      'Berlin',
      'Hesse',
      'North Rhine-Westphalia',
      'Saxony',
      'Baden-Württemberg',
      'Hamburg'
    ],

    Singapore: [
      'Central Region',
      'East Region',
      'North Region',
      'North-East Region',
      'West Region'
    ],

    UAE: [
      'Abu Dhabi',
      'Dubai',
      'Sharjah',
      'Ajman',
      'Fujairah',
      'Ras Al Khaimah',
      'Umm Al Quwain'
    ],

    France: [
      'Île-de-France',
      'Auvergne-Rhône-Alpes',
      'Nouvelle-Aquitaine',
      'Occitanie',
      "Provence-Alpes-Côte d'Azur"
    ],

    Japan: [
      'Tokyo',
      'Osaka',
      'Kanagawa',
      'Aichi',
      'Hokkaido',
      'Fukuoka',
      'Hyōgo'
    ]
  };

  readonly currencyByCountry: Record<string, string> = {
    India: '₹',
    'United States': '$',
    Canada: 'C$',
    'United Kingdom': '£',
    Australia: 'A$',
    Germany: '€',
    Singapore: 'S$',
    UAE: 'AED ',
    France: '€',
    Japan: '¥'
  };

  get currentCurrency(): string {
    return (
      this.currencyByCountry[
        this.taxForm.get('country')?.value ||
        'United States'
      ] || '$'
    );
  }

  currentRegions: string[] =
    this.regionsByCountry['United States'];

  readonly filingStatuses = [
    'Single',
    'Married Filing Jointly',
    'Married Filing Separately',
    'Head of Household'
  ];

  readonly quarters = [
    'Q1 (Jan-Mar 2025)',
    'Q2 (Apr-Jun 2025)',
    'Q3 (Jul-Sep 2025)',
    'Q4 (Oct-Dec 2025)'
  ];

  isCalculating = false;
  isSaving = false;
  isLoadingHistory = false;

  errorMessage = '';
  successMessage = '';

  taxForm;

  private countrySubscription?: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private taxService: TaxService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.taxForm =
      this.formBuilder.nonNullable.group(
        {
          country: [
            'United States',
            Validators.required
          ],

          region: [
            'California',
            Validators.required
          ],

          filingStatus: [
            'Single',
            Validators.required
          ],

          quarter: [
            'Q2 (Apr-Jun 2025)',
            Validators.required
          ],

          annualGrossIncome: [
            0,
            [
              Validators.required,
              Validators.min(0)
            ]
          ],

          grossIncome: [
            0,
            [
              Validators.required,
              Validators.min(0)
            ]
          ],

          deductions:
            this.formBuilder.nonNullable.group({
              businessExpenses: [
                0,
                [Validators.min(0)]
              ],

              retirementContributions: [
                0,
                [Validators.min(0)]
              ],

              healthInsurance: [
                0,
                [Validators.min(0)]
              ],

              homeOffice: [
                0,
                [Validators.min(0)]
              ]
            })
        },
        {
          validators: this.incomeValidator
        }
      );
  }

  incomeValidator(
    control: AbstractControl
  ): ValidationErrors | null {

    const annualGross =
      control.get('annualGrossIncome')?.value || 0;

    const quarterGross =
      control.get('grossIncome')?.value || 0;

    if (annualGross < quarterGross) {
      return {
        incomeMismatch: true
      };
    }

    return null;
  }

  ngOnInit(): void {

    this.loadTaxEstimates();

    this.loadTaxCalendar();

    this.countrySubscription =
      this.taxForm
        .get('country')
        ?.valueChanges
        .subscribe(country => {

          this.currentRegions =
            this.regionsByCountry[country] || [];

          this.taxForm.patchValue({
            region:
              this.currentRegions.length > 0
                ? this.currentRegions[0]
                : ''
          });
        });
  }

  ngOnDestroy(): void {

    if (this.countrySubscription) {
      this.countrySubscription.unsubscribe();
    }
  }

  

  // ==============================
  // Tax Regime
  // ==============================
  private getTaxRegime(): 'new' | 'old' {

    const country =
      this.taxForm.get('country')?.value;

    // Current Indian calculation uses the new regime.
    if (country === 'India') {
      return 'new';
    }

    // Existing non-Indian UI does not currently
    // provide a regime selector.
    return 'old';
  }

  // ==============================
  // Build Tax Data
  // ==============================
  private buildTaxData(): TaxCalculationData {

    const formValue =
      this.taxForm.getRawValue();

    const deductions =
      formValue.deductions;

    const totalDeductions =
      deductions.businessExpenses +
      deductions.retirementContributions +
      deductions.healthInsurance +
      deductions.homeOffice;

    const taxableIncome =
      Math.max(
        0,
        formValue.annualGrossIncome -
        totalDeductions
      );

    return {
      country: formValue.country,
      region: formValue.region,

      taxYear: 'FY 2025-26',

      taxRegime:
        this.getTaxRegime(),

      filingStatus:
        formValue.filingStatus,

      quarter:
        formValue.quarter,

      annualIncome:
        formValue.annualGrossIncome,

      annualGrossIncome:
        formValue.annualGrossIncome,

      grossIncome:
        formValue.grossIncome,

      deductions: {
        businessExpenses:
          deductions.businessExpenses,

        retirementContributions:
          deductions.retirementContributions,

        healthInsurance:
          deductions.healthInsurance,

        homeOffice:
          deductions.homeOffice
      },

      taxableIncome
    };
  }

  // ==============================
  // Calculate Tax
  // ==============================
  calculateTax(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (this.taxForm.invalid) {

      this.taxForm.markAllAsTouched();

      return;
    }

    this.isCalculating = true;
    this.calculationResult = null;

    const data =
      this.buildTaxData();

    this.taxService
      .calculateTax(data)
      .subscribe({

        next: response => {

          const formValue =
            this.taxForm.getRawValue();

          this.calculationResult =
            this.buildCalculationViewModel(
              response,
              formValue
            );

          this.isCalculating = false;

          this.changeDetectorRef.detectChanges();
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.isCalculating = false;

          this.errorMessage =
            error.error?.message ||
            'Unable to calculate tax.';

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  // ==============================
  // Save Estimate
  // ==============================
  saveEstimate(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (
      this.taxForm.invalid ||
      !this.calculationResult
    ) {
      return;
    }

    this.isSaving = true;

    const formValue =
      this.taxForm.getRawValue();

    const data =
      this.buildTaxData();

    this.taxService
      .saveTaxEstimate(data)
      .subscribe({

        next: response => {

          this.isSaving = false;

          this.successMessage =
            response.message;

          this.taxEstimates = [
            this.buildEstimateViewModel(
              response.taxEstimate,
              formValue
            ),
            ...this.taxEstimates
          ];

          this.changeDetectorRef.detectChanges();
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.isSaving = false;

          this.errorMessage =
            error.error?.message ||
            'Unable to save tax estimate.';

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  // ==============================
  // Load Estimates
  // ==============================
  loadTaxEstimates(): void {

    this.isLoadingHistory = true;
    this.errorMessage = '';

    this.taxService
      .getTaxEstimates()
      .subscribe({

        next: response => {

          this.taxEstimates =
            response.taxEstimates.map(
              estimate =>
                this.buildEstimateViewModel(
                  estimate
                )
            );

          this.isLoadingHistory = false;

          this.changeDetectorRef.detectChanges();
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.isLoadingHistory = false;

          this.errorMessage =
            error.error?.message ||
            'Unable to load saved tax estimates.';

          this.changeDetectorRef.detectChanges();
        }
      });
  }


loadTaxCalendar(): void {
  this.taxService
    .getTaxCalendar()
    .subscribe({
      next: response => {
        this.taxCalendarYear = response.taxYear;
        this.taxCalendar = response.calendar;
      }
    });
}

  // ==============================
  // Delete Estimate
  // ==============================
  deleteEstimate(
    estimate: TaxEstimate
  ): void {

    const confirmed =
      window.confirm(
        'Delete this saved tax estimate?'
      );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.taxService
      .deleteTaxEstimate(estimate._id)
      .subscribe({

        next: response => {

          this.taxEstimates =
            this.taxEstimates.filter(
              item =>
                item._id !== estimate._id
            );

          this.successMessage =
            response.message;

          this.changeDetectorRef.detectChanges();
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage =
            error.error?.message ||
            'Unable to delete tax estimate.';

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  trackEstimate(
    index: number,
    estimate: TaxEstimate
  ): string {
    return estimate._id;
  }

  trackSlab(
    index: number,
    slab: { label: string }
  ): string {
    return slab.label;
  }

  getMonthName(
    monthNum: number
  ): string {

    const date = new Date();

    date.setMonth(monthNum - 1);

    return date.toLocaleString(
      'default',
      {
        month: 'long'
      }
    );
  }

  // ==============================
  // Calculation View Model
  // ==============================
  private buildCalculationViewModel(
    response: any,
    formValue:
      ReturnType<
        typeof this.taxForm.getRawValue
      >
  ): TaxCalculationViewModel {

    const estimatedAnnualTax =
      Number(
        response?.estimatedTax ?? 0
      );

    const annualGrossIncome =
      Number(
        formValue.annualGrossIncome ?? 0
      );

    const grossIncome =
      Number(
        formValue.grossIncome ?? 0
      );

    const deductions = {

      businessExpenses:
        Number(
          formValue.deductions
            ?.businessExpenses ?? 0
        ),

      retirementContributions:
        Number(
          formValue.deductions
            ?.retirementContributions ?? 0
        ),

      healthInsurance:
        Number(
          formValue.deductions
            ?.healthInsurance ?? 0
        ),

      homeOffice:
        Number(
          formValue.deductions
            ?.homeOffice ?? 0
        )
    };

    return {

      totalTax:
        estimatedAnnualTax,

      totalIncomeAfterTax:
        annualGrossIncome -
        estimatedAnnualTax,

      slabs: [],

      taxRegimeLabel:
        response?.taxRegimeLabel ||
        'Tax Estimate',

      taxYear:
        response?.taxYear ||
        '2025',

      taxableIncome:
        Number(
          response?.taxableIncome ?? 0
        ),

      estimatedTax:
        estimatedAnnualTax,

      effectiveTaxRate:
        Number(
          response?.effectiveTaxRate ?? 0
        ),

      slabBreakdown:
        Array.isArray(
          response?.slabBreakdown
        )
          ? response.slabBreakdown
          : [],

      quarter:
        formValue.quarter,

      annualGrossIncome,

      grossIncome,

      deductions,

      estimatedAnnualTax,

      estimatedQuarterlyTax:
        estimatedAnnualTax / 4,

      advanceTaxDueDates:
  this.buildAdvanceTaxDueDates(
    '2025-26'
  )
    };
  }

  // ==============================
  // Estimate View Model
  // ==============================
  private buildEstimateViewModel(
    estimate: any,
    formValue?:
      ReturnType<
        typeof this.taxForm.getRawValue
      >
  ): TaxEstimateViewModel {

    const annualGrossIncome =
      Number(
        estimate?.annualIncome ??
        formValue?.annualGrossIncome ??
        0
      );

    const estimatedAnnualTax =
      Number(
        estimate?.estimatedTax ?? 0
      );

    const deductions = {

      businessExpenses:
        Number(
          estimate?.businessExpenses ??
          formValue?.deductions
            ?.businessExpenses ??
          0
        ),

      retirementContributions:
        Number(
          estimate?.retirementContributions ??
          formValue?.deductions
            ?.retirementContributions ??
          0
        ),

      healthInsurance:
        Number(
          estimate?.healthInsurance ??
          formValue?.deductions
            ?.healthInsurance ??
          0
        ),

      homeOffice:
        Number(
          estimate?.homeOffice ??
          formValue?.deductions
            ?.homeOffice ??
          0
        )
    };

    return {

      _id: String(
        estimate?._id ??
        estimate?.id ??
        ''
      ),

      data:
        estimate?.data,

      result:
        estimate?.result,

      country:
        estimate?.country || '',

      region:
        estimate?.region || '',

      taxYear:
        estimate?.taxYear ||
        estimate?.quarter ||
        '',

      taxRegime:
        estimate?.taxRegime ||
        'old',

      filingStatus:
        estimate?.filingStatus ||
        formValue?.filingStatus ||
        'Single',

      quarter:
        estimate?.quarter ||
        formValue?.quarter ||
        '',

      annualIncome:
        annualGrossIncome,

      annualGrossIncome,

      grossIncome:
        Number(
          estimate?.grossIncome ??
          formValue?.grossIncome ??
          0
        ),

      businessExpenses:
        deductions.businessExpenses,

      retirementContributions:
        deductions.retirementContributions,

      healthInsurance:
        deductions.healthInsurance,

      homeOffice:
        deductions.homeOffice,

      deductions,

      taxableIncome:
        Number(
          estimate?.taxableIncome ??
          annualGrossIncome
        ),

      estimatedTax:
        estimatedAnnualTax,

      effectiveTaxRate:
        Number(
          estimate?.effectiveTaxRate ?? 0
        ),

      createdAt:
        estimate?.createdAt,

      estimatedAnnualTax,

      estimatedQuarterlyTax:
        estimatedAnnualTax / 4
    };
  }

  // ==============================
  // Advance Tax Calendar
  // ==============================
  private buildAdvanceTaxDueDates(
    year: string
  ): TaxDueDateViewModel[] {

    return [

      {
        month: 6,
        day: 15,
        label:
          '1st Advance Tax Installment',
        percentage: 15
      },

      {
        month: 9,
        day: 15,
        label:
          '2nd Advance Tax Installment',
        percentage: 45
      },

      {
        month: 12,
        day: 15,
        label:
          '3rd Advance Tax Installment',
        percentage: 75
      },

      {
        month: 3,
        day: 15,
        label:
          '4th Advance Tax Installment',
        percentage: 100
      }
    ];
  }
}