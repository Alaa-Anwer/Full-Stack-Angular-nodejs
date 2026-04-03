import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
    currentUser$: Observable<User | null>;
    cartCount$: Observable<number>;

    constructor(
        private authService: AuthService,
        private cartService: CartService,
        private router: Router
    ) {
        this.currentUser$ = this.authService.currentUser$;
        this.cartCount$ = this.cartService.cart$.pipe(map(items => items.length));
    }

    logout(): void {
        console.debug('[Navbar] Logout clicked');
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
