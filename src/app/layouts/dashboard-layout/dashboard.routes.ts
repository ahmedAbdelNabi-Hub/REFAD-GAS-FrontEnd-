import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
    {
        path: 'statistics',
        pathMatch: "full",
        loadComponent: () => import('../../features/dashboard/pages/statistics/Statistic.component').then((m) => m.StatisticComponent),
    },
    {
        path: 'customers',
        pathMatch: "full",
        loadComponent: () =>
            import('../../features/dashboard/pages/customer/customer.component').then(
                (m) => m.CustomerComponent
            ),
    },
    {
        path: 'customer/add',
        pathMatch: "full",

        loadComponent: () =>
            import('../../features/dashboard/pages/add-customer/add-customer.component').then(
                (m) => m.AddCustomerComponent
            ),
    },
    {
        path: 'cars',
        pathMatch: "full",
        loadComponent: () => import('../../features/dashboard/pages/cars/cars').then((m) => m.CarsComponent),
    },
    {
        path: 'car/add',
        pathMatch: "full",
        loadComponent: () => import('../../features/dashboard/pages/add-car/add-car').then((m) => m.AddCarComponent),
    },
    {
        path: 'car/edit/:id',
        pathMatch: "full",
        loadComponent: () => import('../../features/dashboard/pages/update-car/update-car').then((m) => m.UpdateCarComponent),
    },

    {
        path: 'customer/details/:id',
        pathMatch: "full",
        loadComponent: () => import('../../features/dashboard/pages/customer-details/customer-details.component').then((m) => m.CustomerDetailsComponent),
    },
    {
        path: 'customer/edit/:id',
        pathMatch: "full",
        loadComponent: () => import('../../features/dashboard/pages/update-customer/update-customer.component').then((m) => m.UpdateCustomerComponent),
    },
    {
        path: 'supervisors',
        pathMatch: "full",
        loadComponent: () => import('../../features/dashboard/pages/supervisor/supervisors/supervisors').then((m) => m.SupervisorsComponent),
    },
    {
        path: 'supervisor/add',
        pathMatch: "full",
        loadComponent: () => import('../../features/dashboard/pages/supervisor/add-supervisor/add-supervisor').then((m) => m.AddSupervisorComponent),
    },
    {
        path: 'supervisors/edit/:id',
        pathMatch: "full",
        loadComponent: () => import('../../features/dashboard/pages/supervisor/update-supervisor/update-supervisor').then((m) => m.UpdateSupervisor),
    },
    {
        path: 'vendors',
        pathMatch: "full",
        loadComponent: () => import('../../features/dashboard/pages/vendor/vendors/vendors').then((m) => m.VendorsComponent),
    },
    {
        path: 'vendor/add',
        pathMatch: "full",
        loadComponent: () => import('../../features/dashboard/pages/vendor/add-vendor/add-vendor').then((m) => m.AddVendorComponent),
    },
    {
        path: 'stations',
        pathMatch: "full",
        loadComponent: () => import('../../features/dashboard/pages/stations/stations/stations').then((m) => m.StationsComponent),
    },
    {
        path: 'station/add',
        pathMatch: "full",
        loadComponent: () => import('../../features/dashboard/pages/stations/add-station/add-station').then((m) => m.AddStationComponent),
    },
    {
        path: 'station/edit/:id',
        pathMatch: "full",
        loadComponent: () => import('../../features/dashboard/pages/stations/update-station/update-station').then((m) => m.EditStationComponent),
    },
    {
        path: 'vendor/edit/:id',
        pathMatch: "full",
        loadComponent: () => import('../../features/dashboard/pages/vendor/update-vendor/update-vendor').then((m) => m.UpdateVendor),
    },
    {
        path: 'fuel-orders',
        pathMatch: "full",
        loadComponent: () => import('../../features/dashboard/pages/fuel/fuels/fuels').then((m) => m.Fuels),
    },
    {
        path: 'fuel-orders/details/:id',
        pathMatch: "full",
        loadComponent: () => import('../../features/dashboard/pages/fuel-details/fuel-details').then((m) => m.FuelDetailsComponent),
    },
    {
        path: 'payments',
        pathMatch: "full",
        loadComponent: () => import('../../features/dashboard/pages/Payment/Payment-List/payment-list').then((m) => m.PaymentListComponent),
    },
    {
        path: 'payment/add',
        pathMatch: "full",
        loadComponent: () => import('../../features/dashboard/pages/Payment/add-payment/add-payment').then((m) => m.AddPaymentComponent),
    },
];
