import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { AlertService } from '../services/alert.service';
import { AuthService } from '../services/auth.service';
import { Pagination, Product } from '../models';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    products: Product[] = [];
    isLoading = false;
    errorMessage = '';
    successMessage = '';
    currentPage = 1;
    limit = 9;
    searchQuery = '';
    categoryFilter = '';
    pagination: Pagination | null = null;

    constructor(
        private productService: ProductService,
        private cartService: CartService,
        private alertService: AlertService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts(): void {
        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';
        this.products = [];
        this.pagination = null;

        this.productService.getProducts(
            this.currentPage,
            this.limit,
            this.searchQuery,
            this.categoryFilter
        ).subscribe({
            next: (response) => {
                this.products = [...response.data];
                this.pagination = response.pagination;
                this.isLoading = false;
            },
            error: (error) => {
                this.products = [];
                this.errorMessage = error.error?.message || 'Failed to load products';
                this.isLoading = false;
            }
        });
    }

    onSearchChange(): void {
        this.currentPage = 1;
        this.loadProducts();
    }

    onFilterChange(): void {
        this.currentPage = 1;
        this.loadProducts();
    }

    resetFilters(): void {
        this.searchQuery = '';
        this.categoryFilter = '';
        this.currentPage = 1;
        this.loadProducts();
    }

    nextPage(): void {
        if (this.pagination && this.currentPage < this.pagination.totalPages) {
            this.currentPage++;
            this.loadProducts();
        }
    }

    previousPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadProducts();
        }
    }

    addToCart(product: Product): void {
        if (!this.authService.isLoggedIn()) {
            this.alertService.error('You must login first');
            this.router.navigate(['/login'], { queryParams: { returnUrl: '/' } });
            return;
        }

        if (this.isOutOfStock(product)) {
            return;
        }

        this.cartService.addToCart(product, 1);
        this.successMessage = `${product.title} added to cart.`;
        this.alertService.success(this.successMessage);
    }

    getSafeStock(product: Product | null | undefined): number {
        const rawStock = product?.stock;
        if (typeof rawStock !== 'number' || !Number.isFinite(rawStock)) {
            return 0;
        }

        return Math.max(0, Math.floor(rawStock));
    }

    isLowStock(product: Product | null | undefined): boolean {
        const stock = this.getSafeStock(product);
        return stock > 0 && stock < 10;
    }

    isOutOfStock(product: Product | null | undefined): boolean {
        return this.getSafeStock(product) === 0;
    }
}