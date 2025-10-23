import { CommonModule } from '@angular/common';
import { Component, signal, computed } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {
  isCollapsed = signal<boolean>(false);
  expandedMenus = signal<Set<string>>(new Set());
  activeMenuId = signal<string>('');

  menuItems: MenuItem[] = [
    {
      id: 'statistics',
      label: 'الإحصائيات',
      icon: 'bxs-color',
      route: '/admin'
    },
    {
      id: 'customers',
      label: 'تصفح العملاء المسجلين',
      icon: 'bx-group',
      route: '/admin/customers'
    },
    {
      id: 'vehicles',
      label: 'إدارة السيارات',
      icon: 'bx-car',
      route: '/admin/cars'
    },

    {
      id: 'payments',
      label: 'إدارة المدفوعات',
      icon: 'bx-credit-card',
      route: '/payments'
    },
    {
      id: 'fuel',
      label: 'طلبات الوقود',
      icon: 'bx-gas-pump',
      route: '/fuel-orders'
    },
    {
      id: 'reports',
      label: 'التقارير والتحليلات',
      icon: 'bx-bar-chart-alt-2',
      route: '/reports'
    },
    {
      id: 'admins',
      label: 'إدارة المشرفين',
      icon: 'bx-shield',
      route: '/admin/supervisors'
    },
    {
      id: 'stations',
      label: 'إدارة المحطات',
      icon: 'bx-map',
      route: '/admin/stations'
    },
    {
      id: 'vendors',
      label: 'إدارة الموردين',
      icon: 'bx-buildings',
      route: '/admin/vendors'
    }
  ];

  sidebarWidth = computed(() => this.isCollapsed() ? 'w-0' : 'w-[250px]');

  constructor(private router: Router) { }

  toggleSidebar(): void {
    this.isCollapsed.update(collapsed => !collapsed);
    if (this.isCollapsed()) {
      this.expandedMenus.set(new Set());
    }
  }

  toggleMenu(menuId: string): void {
    if (this.isCollapsed()) return;

    this.expandedMenus.update(expanded => {
      const newExpanded = new Set(expanded);
      if (newExpanded.has(menuId)) {
        newExpanded.delete(menuId);
      } else {
        newExpanded.add(menuId);
      }
      return newExpanded;
    });
  }

  isMenuExpanded(menuId: string): boolean {
    return this.expandedMenus().has(menuId);
  }

  isActiveMenu(menuId: string): boolean {
    return this.activeMenuId() === menuId;
  }

  navigateTo(item: MenuItem): void {
    if (item.route) {
      this.activeMenuId.set(item.id);
      this.router.navigate([item.route]);
    } else if (item.children) {
      this.toggleMenu(item.id);
    }
  }

  logout(): void {
    console.log('تسجيل خروج...');
    this.router.navigate(['/login']);
  }
}