import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { IBaseApiResponse } from "../interfaces/IBaseApiResponse";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: 'root' })
export class AuthService {

    private accessTokenSubject = new BehaviorSubject<string | null>(null);
    accessToken$ = this.accessTokenSubject.asObservable();


    test(): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/auth/test`, {});
    }
    get accessToken(): string | null {
        return this.accessTokenSubject.value;
    }
    set accessToken(token: string | null) {
        this.accessTokenSubject.next(token);
    }

    constructor(private http: HttpClient) { }

    login(credentials: { email: string; password: string }): Observable<IBaseApiResponse<any>> {
        return this.http.post<IBaseApiResponse<any>>(`${environment.apiUrl}/auth/login`, credentials);
    }

    register(formData: FormData): Observable<IBaseApiResponse> {
        return this.http.post<IBaseApiResponse>(`${environment.apiUrl}/auth/register`, formData);
    }

    confirmEmail({ email, otp }: { email: string; otp: string }): Observable<IBaseApiResponse> {
        return this.http.post<IBaseApiResponse>(`${environment.apiUrl}/auth/confirm-email`, { email, otp });
    }
    resendOtp(email: string): Observable<IBaseApiResponse> {
        return this.http.post<IBaseApiResponse>(`${environment.apiUrl}/auth/resend-otp`, { email });
    }
}
