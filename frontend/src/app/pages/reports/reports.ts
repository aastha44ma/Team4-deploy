import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { Sidebar } from '../../components/sidebar/sidebar';
import { Report, ReportService } from '../../services/reports';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Sidebar],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {
  reports: Report[] = [];
  selectedReport: Report | null = null;
  reportForm: FormGroup;

  readonly reportTypes = [
    'Income Statement',
    'Expense Report',
    'Cash Flow Report',
    'Budget Report',
    'Tax Summary',
    'Transaction Summary'
  ];

  readonly periods = [
    'Current Month',
    'Previous Month',
    'Current Quarter',
    'Previous Quarter',
    'Current Year',
    'Previous Year',
    'Custom Period'
  ];

  readonly formats = ['PDF', 'CSV', 'Excel'];

  isGenerating = false;
  isLoadingReports = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private reportService: ReportService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.reportForm = this.formBuilder.group({
      type: [this.reportTypes[0], Validators.required],
      period: [this.periods[0], Validators.required],
      format: ['PDF', Validators.required],
      customStartDate: [''],
      customEndDate: ['']
    });

    this.reportForm.get('period')?.valueChanges.subscribe(value => {
      if (value === 'Custom Period') {
        this.reportForm.get('customStartDate')?.setValidators([Validators.required]);
        this.reportForm.get('customEndDate')?.setValidators([Validators.required]);
      } else {
        this.reportForm.get('customStartDate')?.clearValidators();
        this.reportForm.get('customEndDate')?.clearValidators();
      }
      this.reportForm.get('customStartDate')?.updateValueAndValidity();
      this.reportForm.get('customEndDate')?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoadingReports = true;
    this.reportService.getReports().subscribe({
      next: response => {
        this.reports = response.reports;
        this.isLoadingReports = false;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.isLoadingReports = false;
        this.errorMessage = 'Unable to load recent reports.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  generateReport(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }

    this.isGenerating = true;
    const formValue = this.reportForm.getRawValue();

    this.reportService.generateReport(formValue).subscribe({
      next: response => {
        this.isGenerating = false;
        this.successMessage = response.message;
        this.reports = [response.report, ...this.reports];
        this.selectedReport = response.report;
        this.changeDetectorRef.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.isGenerating = false;
        this.errorMessage = error.error?.message || 'Unable to generate report.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  resetForm(): void {
    this.reportForm.reset({
      type: this.reportTypes[0],
      period: this.periods[0],
      format: 'PDF',
      customStartDate: '',
      customEndDate: ''
    });
    this.errorMessage = '';
    this.successMessage = '';
  }

  selectReport(report: Report): void {
    this.selectedReport = report;
    this.errorMessage = '';
    this.successMessage = '';
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  deleteReport(report: Report, event: Event): void {
    event.stopPropagation();
    const confirmed = window.confirm(`Delete report ${report.name}?`);
    if (!confirmed) return;

    this.reportService.deleteReport(report._id).subscribe({
      next: () => {
        this.reports = this.reports.filter(r => r._id !== report._id);
        if (this.selectedReport?._id === report._id) {
          this.selectedReport = null;
        }
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Unable to delete report.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  printReport(): void {
    window.print();
  }

  downloadReport(): void {
    if (!this.selectedReport) return;
    
    const format = this.selectedReport.format;
    const data = this.selectedReport.data;
    const fileName = `${this.selectedReport.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'CSV' || format === 'Excel') {
      this.downloadCSV(data, fileName);
    } else {
      // For PDF fallback to printing
      this.printReport();
    }
  }

  private downloadCSV(data: any, fileName: string): void {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Simplistic CSV generator based on the data object keys
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'object' && data[key] !== null) {
        // Handle nested objects like category breakdowns
        csvContent += `\n${key.toUpperCase()}\n`;
        Object.keys(data[key]).forEach(subKey => {
          if (typeof data[key][subKey] === 'object') {
             csvContent += `${subKey},${JSON.stringify(data[key][subKey])}\n`;
          } else {
             csvContent += `${subKey},${data[key][subKey]}\n`;
          }
        });
      } else {
        csvContent += `${key},${data[key]}\n`;
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  trackReport(index: number, report: Report): string {
    return report._id;
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
