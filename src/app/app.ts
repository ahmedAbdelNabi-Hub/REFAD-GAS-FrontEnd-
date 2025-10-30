import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from "./shared/components/toast/toast";
import { AuthService } from './core/services/auth.service'; // adjust path as needed

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(private auth: AuthService) { }

  ngOnInit() {
    this.setLanguage('ar');
    this.loadCurrentUser();
  }

  private setLanguage(lang: 'ar' | 'en') {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  }

  private loadCurrentUser() {
    this.auth.loadCurrentUser().subscribe();
  }
}
