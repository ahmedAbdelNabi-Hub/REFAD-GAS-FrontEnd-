import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HeaderService {
    constructor() { }
    private headerName = new BehaviorSubject<string | null>(null);
    private headerName$ = this.headerName.asObservable();

    setHeaderName(name: string) {
        this.headerName.next(name);
    }
    getHeaderName(): Observable<string | null> {
        return this.headerName$;
    }
}