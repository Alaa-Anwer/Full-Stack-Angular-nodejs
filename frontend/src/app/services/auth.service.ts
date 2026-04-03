import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private currentUserSubject = new BehaviorSubject<User | null>(
        this.getUserFromStorage()
    );

    readonly currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        this.syncUserState();
        window.addEventListener('storage', (event) => {
            if (event.key === 'user' || event.key === 'token') {
                this.syncUserState();
            }
        });
    }

    register(data: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
    }

    login(data: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data);
    }

    setToken(token: string, user: User): void {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
        console.debug('[AuthService] User logged in:', user.email);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    private getUserFromStorage(): User | null {
        const user = localStorage.getItem('user');
        if (!user) {
            return null;
        }

        try {
            return JSON.parse(user) as User;
        } catch {
            localStorage.removeItem('user');
            return null;
        }
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.syncUserState();
        console.debug('[AuthService] User logged out');
    }

    isAuthenticated(): boolean {
        return this.isLoggedIn();
    }

    isLoggedIn(): boolean {
        return !!this.getToken() && !!this.getCurrentUser();
    }

    isAdmin(): boolean {
        return this.getCurrentUser()?.role === 'admin';
    }

    private syncUserState(): void {
        const token = localStorage.getItem('token');
        const user = this.getUserFromStorage();

        if (!token || !user) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            this.currentUserSubject.next(null);
            return;
        }

        this.currentUserSubject.next(user);
    }
}
