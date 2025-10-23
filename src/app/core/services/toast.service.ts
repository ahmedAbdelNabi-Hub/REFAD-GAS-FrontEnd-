import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToastService {
    constructor() { }
    private messageSubject = new Subject<{ message: string, type: 'success' | 'error' }>();
    message$ = this.messageSubject.asObservable();

    showSuccess(message: string): void {
        this.messageSubject.next({ message, type: 'success' });
    }

    clear(): void {
        this.messageSubject.next({ message: '', type: 'success' })

    }
    showError(message: string): void {
        this.messageSubject.next({ message, type: 'error' });
    }
}