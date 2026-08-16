import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
	selector: 'app-sidebar',
	standalone: true,
	imports: [RouterLink, RouterLinkActive],
	templateUrl: './sidebar.html',
	styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {

	isLightTheme = false;

	constructor(
		private api: ApiService,
		private router: Router
	) {}

	ngOnInit() {
		this.initializeTheme();
	}

	initializeTheme() {
		const savedTheme =
			typeof window !== 'undefined' &&
			window.localStorage &&
			typeof window.localStorage.getItem === 'function'
				? window.localStorage.getItem('theme')
				: null;

		this.isLightTheme = savedTheme === 'light';

		if (typeof document !== 'undefined') {
			document.body.classList.toggle(
				'light-theme',
				this.isLightTheme
			);
		}
	}

	toggleTheme() {
		this.isLightTheme = !this.isLightTheme;

		if (typeof document !== 'undefined') {
			document.body.classList.toggle(
				'light-theme',
				this.isLightTheme
			);
		}

		if (typeof window !== 'undefined' && window.localStorage) {
			window.localStorage.setItem(
				'theme',
				this.isLightTheme ? 'light' : 'dark'
			);
		}
	}

	logout() {
		this.api.logout();
		this.router.navigate(['/login']);
	}
}
