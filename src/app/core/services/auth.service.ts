// auth.service.ts
import { Injectable, inject, PLATFORM_ID, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '../../environments/environment';
import { IUser } from '../interfaces/Authentication/IUser';
import * as CryptoJS from 'crypto-js';
import { IAuthResponse } from '../interfaces/Authentication/IAuthResponse';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly storageKey = 'enc_kk';
    private readonly secretKey = 'YOUR_SECRET_KEY';
    private readonly isBrowser: boolean;

    private userSignal = signal<IUser | null>(null);
    private loadingSubject = new BehaviorSubject<boolean>(true);
    public isLoading$ = this.loadingSubject.asObservable();
    public isAuthLoading = toSignal(this.loadingSubject, { initialValue: true });
    public currentUser = computed(() => this.userSignal());

    public isLoggedIn = computed(() => {
        const user = this.userSignal();
        const loading = this.isAuthLoading();
        return !loading && !!user;
    });

    public isAdmin = computed(() => {
        const user = this.userSignal();
        const loading = this.isAuthLoading();
        if (loading || !user) return false;
        return user.role.toLowerCase() === 'admin';
    });

    public isCompany = computed(() => {
        const user = this.userSignal();
        const loading = this.isAuthLoading();
        if (loading || !user) return false;
        return user.role.toLowerCase() === 'company';
    });

    public UserId = computed(() => this.userSignal()?.id || null);

    constructor(private http: HttpClient) {
        const platformId = inject(PLATFORM_ID);
        this.isBrowser = isPlatformBrowser(platformId);
        if (this.isBrowser) {
            this.loadUserFromStorage();
        }
    }

    init(): Observable<IUser | null> {
        this.loadingSubject.next(true);

        // If we already have user from storage, resolve immediately
        const userFromStorage = this.userSignal();
        if (userFromStorage) {
            this.loadingSubject.next(false);
            return of(userFromStorage);
        }

        // Otherwise load from API
        return this.loadCurrentUser();
    }

    private loadUserFromStorage(): void {
        if (!this.isBrowser) return;
        const data = localStorage.getItem(this.storageKey);
        if (data) {
            const user = this.decryptData(data);
            if (user) {
                this.userSignal.set(user);
            }
        }
    }

    loadCurrentUser(): Observable<IUser | null> {
        return this.http.get<IUser>(`${environment.apiUrl}/auth/current-user`).pipe(
            tap((user) => {
                if (user) {
                    this.userSignal.set(user);
                    if (this.isBrowser) {
                        localStorage.setItem(this.storageKey, this.encryptData(user));
                    }
                }
                this.loadingSubject.next(false);
            }),
            catchError(() => {
                this.loadingSubject.next(false);
                return of(null);
            })
        );
    }

    login(credentials: { email: string; password: string }): Observable<IAuthResponse> {
        return this.http.post<IAuthResponse>(`${environment.apiUrl}/auth/login`, credentials, { withCredentials: true });
    }

    private encryptData(data: IUser): string {
        return CryptoJS.AES.encrypt(JSON.stringify(data), this.secretKey).toString();
    }

    private decryptData(data: string): IUser | null {
        try {
            const bytes = CryptoJS.AES.decrypt(data, this.secretKey);
            return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        } catch {
            return null;
        }
    }

    get userId(): string | null {
        return this.currentUser()?.id || null;
    }

    get role(): string | null {
        return this.currentUser()?.role || null;
    }

    logout(): void {
        this.userSignal.set(null);
        if (this.isBrowser) {
            localStorage.removeItem(this.storageKey);
        }
    }
}