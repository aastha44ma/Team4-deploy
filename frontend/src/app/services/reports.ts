import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
// Auth type may not expose getToken in its typings; use a looser type for authService

export interface ReportGenerationData {
  type: string;
  period: string;
  format: string;
  customStartDate?: string;
  customEndDate?: string;
}

export interface Report {
  _id: string;
  user: string;
  name: string;
  type: string;
  period: string;
  format: string;
  data: any;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateReportResponse {
  message: string;
  report: Report;
}

export interface ReportListResponse {
  count: number;
  reports: Report[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly API_URL = 'http://localhost:5000/api/reports';

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.apiService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  generateReport(data: ReportGenerationData): Observable<GenerateReportResponse> {
    return this.http.post<GenerateReportResponse>(
      `${this.API_URL}/generate`,
      data,
      { headers: this.getHeaders() }
    );
  }

  getReports(): Observable<ReportListResponse> {
    return this.http.get<ReportListResponse>(
      this.API_URL,
      { headers: this.getHeaders() }
    );
  }

  deleteReport(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.API_URL}/${id}`,
      { headers: this.getHeaders() }
    );
  }
}