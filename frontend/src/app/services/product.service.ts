import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse, Product, ProductsResponse } from '../models';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = `${environment.apiUrl}/products`;
    private uploadsBaseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient) { }

    /**
     * Get all products with pagination, filtering, and search
     */
    getProducts(
        page: number = 1,
        limit: number = 10,
        search: string = '',
        category: string = '',
        minPrice?: number,
        maxPrice?: number
    ): Observable<ProductsResponse> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        if (search) params = params.set('search', search);
        if (category) params = params.set('category', category);
        if (minPrice !== undefined) params = params.set('minPrice', minPrice.toString());
        if (maxPrice !== undefined) params = params.set('maxPrice', maxPrice.toString());

        return this.http.get<any>(this.apiUrl, { params }).pipe(
            map(response => {
                const rawProducts = Array.isArray(response?.data)
                    ? response.data
                    : Array.isArray(response?.products)
                        ? response.products
                        : [];
                const normalizedProducts = rawProducts.map((product: Product) => this.normalizeProductImage(product));

                return {
                    success: response?.success ?? true,
                    data: normalizedProducts,
                    pagination: response?.pagination ?? {
                        currentPage: page,
                        totalPages: 1,
                        totalItems: rawProducts.length,
                        itemsPerPage: limit,
                    }
                } as ProductsResponse;
            })
        );
    }

    /**
     * Get single product by ID
     */
    getProductById(id: string): Observable<ApiResponse<Product>> {
        return this.http.get<ApiResponse<Product> | { product: Product } | Product>(`${this.apiUrl}/${id}`).pipe(
            map(response => ({
                success: (response as ApiResponse<Product>)?.success ?? true,
                message: (response as ApiResponse<Product>)?.message,
                data: this.normalizeProductImage(
                    (response as ApiResponse<Product>)?.data
                    ?? (response as { product: Product })?.product
                    ?? (response as Product)
                )
            }))
        );
    }

    /**
     * Create product (Admin only)
     */
    createProduct(product: Product, imageFile?: File | null): Observable<ApiResponse<Product>> {
        const formData = this.buildProductPayload(product, imageFile);
        return this.http.post<ApiResponse<Product>>(this.apiUrl, formData).pipe(
            map(response => ({
                ...response,
                data: this.normalizeProductImage(response.data)
            }))
        );
    }

    /**
     * Update product (Admin only)
     */
    updateProduct(id: string, product: Partial<Product>, imageFile?: File | null): Observable<ApiResponse<Product>> {
        const formData = this.buildProductPayload(product, imageFile);
        return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, formData).pipe(
            map(response => ({
                ...response,
                data: this.normalizeProductImage(response.data)
            }))
        );
    }

    /**
     * Delete product (Admin only)
     */
    deleteProduct(id: string): Observable<ApiResponse<null>> {
        return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
    }

    /**
     * Get unique categories
     */
    getCategories(): Observable<ProductsResponse> {
        return this.getProducts(1, 1000);
    }

    private buildProductPayload(product: Partial<Product>, imageFile?: File | null): FormData {
        const formData = new FormData();

        Object.entries(product).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });

        if (imageFile) {
            formData.append('image', imageFile);
        }

        return formData;
    }

    private normalizeProductImage(product: Product): Product {
        if (!product?.image) {
            return { ...product, image: 'https://via.placeholder.com/200' };
        }

        if (product.image.startsWith('http://') || product.image.startsWith('https://')) {
            return product;
        }

        if (product.image.startsWith('/')) {
            return { ...product, image: `${this.uploadsBaseUrl}${product.image}` };
        }

        return { ...product, image: `${this.uploadsBaseUrl}/${product.image}` };
    }
}
