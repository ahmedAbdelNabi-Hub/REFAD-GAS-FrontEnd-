import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { AuthService } from '../../core/services/auth.service';
import { SidebarComponent } from '../../features/dashboard/components/sidebar/sidebar';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [RouterOutlet, CommonModule, SidebarComponent],
    template:
        `
        <app-sidebar #sidebar></app-sidebar>
        <main class="w-full h-screen    transition-all duration-300"
              [class.lg:ps-[250px]]="!sidebar.isCollapsed()"
              [class.lg:ps-10]="sidebar.isCollapsed()">
          <router-outlet></router-outlet>
        </main>`,
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
    private auth = inject(AuthService);
    ngOnInit(): void {
        console.log("ssssssssss", this.auth.currentUser);
    }
    ngOnDestroy(): void {

    }
}
