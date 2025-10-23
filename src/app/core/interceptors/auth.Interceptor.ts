import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private isRefreshing = false;

    constructor(private http: HttpClient, private router: Router) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401 && !this.isRefreshing) {
                    this.isRefreshing = true;
                    return this.http.post('https://localhost:7069/api/auth/refresh-token', {}, { withCredentials: true }).pipe(
                        switchMap(() => {
                            this.isRefreshing = false;
                            return next.handle(req.clone());
                        }),
                        catchError(err => {
                            this.isRefreshing = false;
                            this.router.navigate(['/login']);
                            return throwError(() => err);
                        })
                    );
                }
                return throwError(() => error);
            })
        );
    }
}
