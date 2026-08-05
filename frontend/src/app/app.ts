import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ApiService } from './services/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  protected readonly title = signal('TaxPal');


  constructor(
    private apiService: ApiService,
    private router: Router
  ) {

    const token = this.apiService.getToken();


    if(token) {

      const currentUrl = this.router.url;


      // only redirect if user opens app fresh
      if(
        currentUrl === '/' ||
        currentUrl === '/login' ||
        currentUrl === '/register'
      ) {

        this.router.navigate(['/dashboard']);

      }

    }

  }

}