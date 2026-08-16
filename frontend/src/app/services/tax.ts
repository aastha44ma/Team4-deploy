import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TaxDeductions {
  businessExpenses: number;
  retirementContributions: number;
  healthInsurance: number;
  homeOffice: number;
}

export interface TaxCalculationData {
  country: string;
  region: string;
  taxYear: string;
  taxRegime: string;
  filingStatus: string;
  quarter: string;

  annualIncome: number;
  annualGrossIncome: number;
  grossIncome: number;

  deductions: TaxDeductions;

  taxableIncome: number;
}

export interface TaxSlab {
  label: string;
  amount: number;
}

export interface TaxCalculationResult {
  totalTax: number;
  totalIncomeAfterTax: number;
  slabs: TaxSlab[];

  taxRegimeLabel: string;
  taxYear: string;
  taxableIncome: number;
  estimatedTax: number;
  effectiveTaxRate: number;

  slabBreakdown: Array<{
    label: string;
    taxableAmount: number;
    rate: number;
    taxAmount: number;
  }>;
}

export interface TaxEstimate {
  id?: number;
  _id: string;

  data?: TaxCalculationData;
  result?: TaxCalculationResult;

  country: string;
  region?: string;
  taxYear: string;
  taxRegime: string;
  filingStatus?: string;
  quarter?: string;

  annualIncome: number;
  annualGrossIncome?: number;
  grossIncome: number;

  businessExpenses?: number;
  retirementContributions?: number;
  healthInsurance?: number;
  homeOffice?: number;

  deductions?: TaxDeductions;

  taxableIncome: number;
  estimatedTax: number;
  effectiveTaxRate: number;

  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaxService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient
  ) {}

  private getOptions() {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;

    let headers = new HttpHeaders();

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

  calculateTax(
    data: TaxCalculationData
  ): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/tax-estimates`,
      data,
      this.getOptions()
    );
  }

  saveTaxEstimate(
    data: TaxCalculationData
  ): Observable<{
    message: string;
    taxEstimate: TaxEstimate;
  }> {
    return this.http.post<{
      message: string;
      taxEstimate: TaxEstimate;
    }>(
      `${this.baseUrl}/tax-estimates`,
      data,
      this.getOptions()
    );
  }

  getTaxEstimates(): Observable<{
    taxEstimates: TaxEstimate[];
  }> {
    return this.http.get<{
      taxEstimates: TaxEstimate[];
    }>(
      `${this.baseUrl}/tax-estimates`,
      this.getOptions()
    );
  }

  deleteTaxEstimate(
    id: string
  ): Observable<{ message: string }> {
    return this.http.delete<{
      message: string;
    }>(
      `${this.baseUrl}/tax-estimates/${id}`,
      this.getOptions()
    );
  }
}