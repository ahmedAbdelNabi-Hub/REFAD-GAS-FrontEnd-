import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, finalize, switchMap, tap, catchError, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { FormErrorComponent } from '../../../../shared/components/form-error/form-error.component';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormErrorComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnDestroy {
  loginForm: FormGroup;
  loading = false;
  private destroy$ = new Subject<void>();
  private toaster = inject(ToastService);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    const credentials = this.loginForm.value;
    this.auth.login(credentials).pipe(
      switchMap(() =>
        this.auth.loadCurrentUser().pipe(
          catchError(() => {
            this.toaster.showError('Failed to load user info.');
            return of(null);
          })
        )
      ),
      tap(user => {
        if (!user) {
          this.toaster.showError('Login failed. Please try again.');
          return;
        }
        debugger;
        const role = user.role?.toLowerCase();
        if (role === 'admin') {
          this.router.navigate(['/dashboard/statistics']);
        }
        else if (role === 'company') {
          this.router.navigate(['/dashboard/statistics']);
        }
        else {
          this.router.navigate(['/user/dashboard']);
        }
      }),
      catchError(error => {
        console.log(error);
        this.toaster.showError(error?.error?.message || 'Login failed. Please check your credentials.');
        return of(null);
      }),
      finalize(() => (this.loading = false)),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
