import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import {
  TaxCalculationData,
  TaxCalculationResult,
  TaxEstimate,
  TaxService
} from '../../services/tax';

@Component({
  selector: 'app-tax-calculator',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './tax-calculator.html',
  styleUrl: './tax-calculator.css'
})
export class TaxCalculator implements OnInit {
  calculationResult: TaxCalculationResult | null = null;
  taxEstimates: TaxEstimate[] = [];

  readonly countries = [
    'India'
  ];

  readonly regions = [
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
  ];

  readonly taxYears = [
    'FY 2024-25',
    'FY 2025-26'
  ];

  readonly taxRegimes = [
    {
      value: 'new',
      label: 'New Tax Regime'
    },
    {
      value: 'old',
      label: 'Old Tax Regime'
    }
  ];

  isCalculating = false;
  isSaving = false;
  isLoadingHistory = false;

  errorMessage = '';
  successMessage = '';

  taxForm;

  constructor(
    private formBuilder: FormBuilder,
    private taxService: TaxService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.taxForm = this.formBuilder.nonNullable.group({
      country: [
        'India',
        Validators.required
      ],

      region: [
        'Uttar Pradesh'
      ],

      taxYear: [
        'FY 2025-26',
        Validators.required
      ],

      taxRegime: [
        'new',
        Validators.required
      ],

      taxableIncome: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ]
    });
  }

  ngOnInit(): void {
    this.loadTaxEstimates();
  }

  calculateTax(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.taxForm.invalid) {
      this.taxForm.markAllAsTouched();
      return;
    }

    this.isCalculating = true;
    this.calculationResult = null;

    const data: TaxCalculationData =
      this.taxForm.getRawValue();

    this.taxService.calculateTax(data).subscribe({
      next: (response: TaxCalculationResult) => {
        this.calculationResult = response;
        this.isCalculating = false;

        this.changeDetectorRef.detectChanges();
      },

      error: (error: HttpErrorResponse) => {
        this.isCalculating = false;

        this.errorMessage =
          error.error?.message ||
          'Unable to calculate tax.';

        this.changeDetectorRef.detectChanges();
      }
    });
  }

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

    const data: TaxCalculationData =
      this.taxForm.getRawValue();

    this.taxService.saveTaxEstimate(data).subscribe({
      next: (response: {message: string; taxEstimate: TaxEstimate}) => {
        this.isSaving = false;

        this.successMessage = response.message;

        this.taxEstimates = [
          response.taxEstimate,
          ...this.taxEstimates
        ];

        this.changeDetectorRef.detectChanges();
      },

      error: (error: HttpErrorResponse) => {
        this.isSaving = false;

        this.errorMessage =
          error.error?.message ||
          'Unable to save tax estimate.';

        this.changeDetectorRef.detectChanges();
      }
    });
  }

  loadTaxEstimates(): void {
    this.isLoadingHistory = true;
    this.errorMessage = '';

    this.taxService.getTaxEstimates().subscribe({
      next: (response: {taxEstimates: TaxEstimate[]}) => {
        this.taxEstimates = response.taxEstimates;
        this.isLoadingHistory = false;

        this.changeDetectorRef.detectChanges();
      },

      error: (error: HttpErrorResponse) => {
        this.isLoadingHistory = false;

        this.errorMessage =
          error.error?.message ||
          'Unable to load saved tax estimates.';

        this.changeDetectorRef.detectChanges();
      }
    });
  }

  deleteEstimate(estimate: TaxEstimate): void {
    const confirmed = window.confirm(
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
        next: (response: {message: string}) => {
            this.taxEstimates =
              this.taxEstimates.filter(
                item => item._id !== estimate._id
              );

            this.successMessage = response.message;

            this.changeDetectorRef.detectChanges();
          },

        error: (error: HttpErrorResponse) => {
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
    slab: {
      label: string;
    }
  ): string {
    return slab.label;
  }
}