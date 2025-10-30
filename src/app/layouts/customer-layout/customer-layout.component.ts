import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [ CommonModule,],
    template:
        `
       `,
})

export class CustomerLayoutComponent implements OnInit, OnDestroy {
    private auth = inject(AuthService);

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

}
