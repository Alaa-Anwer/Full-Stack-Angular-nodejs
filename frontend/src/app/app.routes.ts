import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'cart',
        loadComponent: () => import('./pages/cart.component').then(m => m.CartComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'orders',
        loadComponent: () => import('./pages/orders.component').then(m => m.OrdersComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'orders/:id',
        loadComponent: () => import('./pages/order-details.component').then(m => m.OrderDetailsComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'product/:id',
        loadComponent: () => import('./pages/product-details.component').then(m => m.ProductDetailsComponent)
    },
    {
        path: 'admin',
        loadComponent: () => import('./pages/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [AdminGuard]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
