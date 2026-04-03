import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../services/alert.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private alertService: AlertService,
        private router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const isLoggedIn = this.authService.isLoggedIn();
        console.debug('[AuthGuard] Access check:', state.url, 'loggedIn:', isLoggedIn);

        if (isLoggedIn) {
            return true;
        }

        this.alertService.error('You must login first');
        this.router.navigate(['/login'], {
            queryParams: {
                returnUrl: state.url,
                authMessage: 'You must login first'
            }
        });
        return false;
    }
}
