import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TaxCalculationData {
  country: string;
  region: string;
  taxYear: string;
  taxRegime: string;
  taxableIncome: number;
}

export interface TaxSlab {
  label: string;
  amount: number;
}

export interface TaxCalculationResult {
  // legacy/compact fields
  totalTax: number;
  totalIncomeAfterTax: number;
  slabs: TaxSlab[];

  // fields referenced by the template
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
  _id: string;
  // keep nested forms if API returns them
  data?: TaxCalculationData;
  result?: TaxCalculationResult;

  // flat fields used by the template
  country: string;
  region?: string;
  taxYear: string;
  taxRegime: string;
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

  calculateTax(data: TaxCalculationData): Observable<TaxCalculationResult> {
    return this.http.post<TaxCalculationResult>(
      `${this.baseUrl}/tax/calculate`,
      data
    );
  }

  saveTaxEstimate(data: TaxCalculationData): Observable<{message: string; taxEstimate: TaxEstimate}> {
    return this.http.post<{message: string; taxEstimate: TaxEstimate}>(
      `${this.baseUrl}/tax/estimates`,
      data
    );
  }

  getTaxEstimates(): Observable<{taxEstimates: TaxEstimate[]}> {
    return this.http.get<{taxEstimates: TaxEstimate[]}>(
      `${this.baseUrl}/tax/estimates`
    );
  }

  deleteTaxEstimate(id: string): Observable<{message: string}> {
    return this.http.delete<{message: string}>(
      `${this.baseUrl}/tax/estimates/${id}`
    );
  }

}
