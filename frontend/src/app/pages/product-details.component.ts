import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { AlertService } from '../services/alert.service';
import { AuthService } from '../services/auth.service';
import { Product } from '../models';

@Component({
    selector: 'app-product-details',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './product-details.component.html',
    styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
    product: Product | null = null;
    isLoading = false;
    errorMessage = '';
    successMessage = '';
    quantity = 1;

    constructor(
        private productService: ProductService,
        private cartService: CartService,
        private alertService: AlertService,
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(paramMap => {
            const productId = paramMap.get('id');

            if (!productId) {
                this.errorMessage = 'Invalid product ID.';
                return;
            }

            this.loadProduct(productId);
        });
    }

    loadProduct(id: string): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.productService.getProductById(id).subscribe({
            next: (response) => {
                this.product = response.data;
                this.isLoading = false;
            },
            error: (error) => {
                this.product = null;
                this.errorMessage = error.error?.message || 'Failed to load product';
                this.isLoading = false;
            }
        });
    }

    addToCart(): void {
        if (!this.authService.isLoggedIn()) {
            this.alertService.error('You must login first');
            const returnUrl = this.route.snapshot.url.length
                ? `/product/${this.route.snapshot.paramMap.get('id') ?? ''}`
                : '/';
            this.router.navigate(['/login'], { queryParams: { returnUrl } });
            return;
        }

        if (!this.product || this.isOutOfStock(this.product)) {
            return;
        }

        const safeStock = this.getSafeStock(this.product);
        const safeQuantity = Math.max(1, Math.min(Math.floor(this.quantity), safeStock));

        if (safeQuantity > 0) {
            this.quantity = safeQuantity;
            this.cartService.addToCart(this.product, this.quantity);
            this.successMessage = `${this.quantity}x ${this.product.title} added to cart.`;
            this.alertService.success(this.successMessage);
            this.router.navigate(['/cart']);
        }
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

    goBack(): void {
        this.router.navigate(['/']);
    }
}
