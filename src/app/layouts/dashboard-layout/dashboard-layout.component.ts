import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../features/dashboard/components/sidebar/sidebar';
import { CompanySidebarComponent } from '../../features/company/components/sidebar/sidebar';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [RouterOutlet, CommonModule, SidebarComponent, CompanySidebarComponent],
    template: `
    <ng-container *ngIf="isAdmin(); else companySidebar">
      <app-sidebar #sidebar></app-sidebar>
      <main
        class="w-full h-screen transition-all duration-300"
        [class.lg:ps-[250px]]="!sidebar.isCollapsed()"
        [class.lg:ps-10]="sidebar.isCollapsed()"
      >
        <router-outlet></router-outlet>
      </main>
    </ng-container>

    <ng-template #companySidebar>
      <app-company-sidebar #companySidebarRef></app-company-sidebar>
      <main
        class="w-full h-screen transition-all duration-300"
        [class.lg:ps-[250px]]="!companySidebarRef.isCollapsed()"
        [class.lg:ps-10]="companySidebarRef.isCollapsed()"
      >
        <router-outlet></router-outlet>
      </main>
    </ng-template>
  `,
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
    private auth = inject(AuthService);

    isAdmin(): boolean {
        return this.auth.isAdmin();
    }

    ngOnInit(): void { }

    ngOnDestroy(): void { }
}
