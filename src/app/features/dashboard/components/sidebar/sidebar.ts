import { CommonModule } from '@angular/common';
import { Component, signal, computed } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  includeRoutes?: string[];
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

  public allMenuItems: MenuItem[] = [
    {
      id: 'statistics',
      label: 'الإحصائيات',
      icon: 'bxs-color',
      route: '/dashboard/statistics',
      includeRoutes: ['/dashboard/statistics']
    },
    {
      id: 'customers',
      label: 'تصفح العملاء المسجلين',
      icon: 'bx-group',
      route: '/dashboard/customers',
      includeRoutes: ['/dashboard/customer/add', '/dashboard/customer/edit', '/dashboard/customer/details']
    },
    {
      id: 'vehicles',
      label: 'إدارة السيارات',
      icon: 'bx-car',
      route: '/dashboard/cars',
      includeRoutes: ['/dashboard/car/add', '/dashboard/car/edit', '/dashboard/car/details']
    },
    {
      id: 'payments',
      label: 'إدارة المدفوعات',
      icon: 'bx-credit-card',
      route: '/dashboard/payments',
      includeRoutes: ['/dashboard/payment/add', '/dashboard/payment/edit', '/dashboard/payment/details']
    },
    {
      id: 'fuel',
      label: 'طلبات الوقود',
      icon: 'bx-gas-pump',
      route: '/dashboard/fuel-orders',
      includeRoutes: ['/dashboard/fuel-order/add', '/dashboard/fuel-order/edit', '/dashboard/fuel-order/details']
    },
    {
      id: 'reports',
      label: 'التقارير والتحليلات',
      icon: 'bx-bar-chart-alt-2',
      route: '/dashboard/reports',
      includeRoutes: ['/dashboard/reports']
    },
    {
      id: 'admins',
      label: 'إدارة المشرفين',
      icon: 'bx-shield',
      route: '/dashboard/supervisors',
      includeRoutes: ['/dashboard/supervisor/add', '/dashboard/supervisor/edit', '/dashboard/supervisor/details']
    },
    {
      id: 'stations',
      label: 'إدارة المحطات',
      icon: 'bx-map',
      route: '/dashboard/stations',
      includeRoutes: ['/dashboard/station/add', '/dashboard/station/edit', '/dashboard/station/details']
    },
    {
      id: 'vendors',
      label: 'إدارة الموردين',
      icon: 'bx-buildings',
      route: '/dashboard/vendors',
      includeRoutes: ['/dashboard/vendor/add', '/dashboard/vendor/edit', '/dashboard/vendor/details']
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
      if (newExpanded.has(menuId)) newExpanded.delete(menuId);
      else newExpanded.add(menuId);
      return newExpanded;
    });
  }

  isMenuExpanded(menuId: string): boolean {
    return this.expandedMenus().has(menuId);
  }

  isActive(route: string, includeRoutes: string[] = []): boolean {
    const currentUrl = this.router.url;
    // Match main route
    if (currentUrl.startsWith(route)) return true;
    // Match included sub-routes
    return includeRoutes.some(sub => currentUrl.startsWith(sub));
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