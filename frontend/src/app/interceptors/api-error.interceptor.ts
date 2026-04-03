import { Injectable } from '@angular/core';
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiErrorService } from '../services/api-error.service';

interface NormalizedErrorBody {
    success?: boolean;
    message?: string;
    code?: string;
}

@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {
    constructor(private apiErrorService: ApiErrorService) { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                const backendPayload: NormalizedErrorBody =
                    error.error && typeof error.error === 'object'
                        ? (error.error as NormalizedErrorBody)
                        : {};

                const fallbackMessage = this.getFallbackMessage(error.status);
                const message = backendPayload.message ?? fallbackMessage;
                const code = backendPayload.code ?? `HTTP_${error.status || 0}`;

                this.apiErrorService.setMessage(message);

                const normalizedError = new HttpErrorResponse({
                    headers: error.headers,
                    status: error.status,
                    statusText: error.statusText,
                    url: error.url ?? undefined,
                    redirected: error.redirected,
                    error: {
                        ...backendPayload,
                        success: false,
                        message,
                        code,
                    },
                });

                return throwError(() => normalizedError);
            })
        );
    }

    private getFallbackMessage(statusCode: number): string {
        switch (statusCode) {
            case 0:
                return 'Network error. Please check your connection.';
            case 400:
                return 'Invalid request data.';
            case 401:
                return 'Unauthorized access.';
            case 403:
                return 'Forbidden action.';
            case 404:
                return 'Requested resource was not found.';
            case 409:
                return 'Conflict detected. Please refresh and try again.';
            default:
                return 'Unexpected server error. Please try again later.';
        }
    }
}
