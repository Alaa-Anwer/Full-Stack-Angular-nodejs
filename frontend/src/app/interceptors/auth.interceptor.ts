import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AlertService } from '../services/alert.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private authService: AuthService,
        private alertService: AlertService,
        private router: Router
    ) { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        // Get token from auth service
        const token = this.authService.getToken();

        // Clone request and add token if it exists
        if (token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                // Handle 401 Unauthorized - token expired or invalid
                if (error.status === 401) {
                    console.debug('[AuthInterceptor] 401 received. Redirecting to login.');
                    this.authService.logout();
                    this.alertService.error('You must login first');
                    this.router.navigate(['/login'], {
                        queryParams: {
                            authMessage: 'You must login first'
                        }
                    });
                }
                return throwError(() => error);
            })
        );
    }
}
