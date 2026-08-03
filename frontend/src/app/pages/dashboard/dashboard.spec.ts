import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { Dashboard } from './dashboard';
import { ApiService } from '../../services/api';

class MockApiService {
  getTransactions() { return of({ data: [] }); }
}

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    // Mock localStorage used by the component
    (globalThis as any).localStorage = {
      getItem: (key: string) => null,
      setItem: (key: string, value: string) => {},
      removeItem: (key: string) => {}
    };
    await TestBed.configureTestingModule({
      imports: [Dashboard, RouterTestingModule],
      providers: [
        { provide: ApiService, useClass: MockApiService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});