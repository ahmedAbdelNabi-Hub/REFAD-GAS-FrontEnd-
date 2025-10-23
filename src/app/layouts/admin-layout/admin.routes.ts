import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        pathMatch: "full",
        loadComponent: () =>
            import('../../features/admin/pages/dashboard/dashboard.component').then(
                (m) => m.DashboardComponent
            ),
    },
    {
        path: 'customers',
        pathMatch: "full",

        loadComponent: () =>
            import('../../features/admin/pages/customer/customer.component').then(
                (m) => m.CustomerComponent
            ),
    },
    {
        path: 'customer/add',
        pathMatch: "full",

        loadComponent: () =>
            import('../../features/admin/pages/add-customer/add-customer.component').then(
                (m) => m.AddCustomerComponent
            ),
    },
    {
        path: 'cars',
        pathMatch: "full",
        loadComponent: () => import('../../features/admin/pages/cars/cars').then((m) => m.CarsComponent),
    },
    {
        path: 'cars/add',
        pathMatch: "full",
        loadComponent: () => import('../../features/admin/pages/add-car/add-car').then((m) => m.AddCarComponent),
    },
    {
        path: 'car/edit/:id',
        pathMatch: "full",
        loadComponent: () => import('../../features/admin/pages/update-car/update-car').then((m) => m.UpdateCarComponent),
    },

    {
        path: 'customer/details/:id',
        pathMatch: "full",
        loadComponent: () => import('../../features/admin/pages/customer-details/customer-details.component').then((m) => m.CustomerDetailsComponent),
    },
    {
        path: 'customer/edit/:id',
        pathMatch: "full",
        loadComponent: () => import('../../features/admin/pages/update-customer/update-customer.component').then((m) => m.UpdateCustomerComponent),
    },
    {
        path: 'supervisors',
        pathMatch: "full",
        loadComponent: () => import('../../features/admin/pages/supervisor/supervisors/supervisors').then((m) => m.SupervisorsComponent),
    },
    {
        path: 'supervisor/add',
        pathMatch: "full",
        loadComponent: () => import('../../features/admin/pages/supervisor/add-supervisor/add-supervisor').then((m) => m.AddSupervisorComponent),
    },
    {
        path: 'supervisors/edit/:id',
        pathMatch: "full",
        loadComponent: () => import('../../features/admin/pages/supervisor/update-supervisor/update-supervisor').then((m) => m.UpdateSupervisor),
    },
    {
        path: 'vendors',
        pathMatch: "full",
        loadComponent: () => import('../../features/admin/pages/vendor/vendors/vendors').then((m) => m.VendorsComponent),
    },
    {
        path: 'vendor/add',
        pathMatch: "full",
        loadComponent: () => import('../../features/admin/pages/vendor/add-vendor/add-vendor').then((m) => m.AddVendorComponent),
    },
    {
        path: 'stations',
        pathMatch: "full",
        loadComponent: () => import('../../features/admin/pages/stations/stations/stations').then((m) => m.StationsComponent),
    },
    {
        path: 'station/add',
        pathMatch: "full",
        loadComponent: () => import('../../features/admin/pages/stations/add-station/add-station').then((m) => m.AddStationComponent),
    },
    {
        path: 'vendor/edit/:id',
        pathMatch: "full",
        loadComponent: () => import('../../features/admin/pages/vendor/update-vendor/update-vendor').then((m) => m.UpdateVendor),
    }
];
