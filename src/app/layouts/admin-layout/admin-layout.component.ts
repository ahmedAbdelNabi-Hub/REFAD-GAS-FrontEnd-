import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { SidebarComponent } from "../../features/admin/components/sidebar/sidebar";

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [RouterOutlet, CommonModule, SidebarComponent],
    template:
        `
        <app-sidebar #sidebar></app-sidebar>
        <main class="w-full h-screen bg-[#fafafa]  px-1 md:px-4 transition-all duration-300"
              [class.lg:ps-[260px]]="!sidebar.isCollapsed()"
              [class.lg:ps-10]="sidebar.isCollapsed()">
          <router-outlet></router-outlet>
        </main>`,
})
export class AdminLayoutComponent implements OnInit, OnDestroy {

    ngOnInit(): void {

    }
    ngOnDestroy(): void {

    }
}
