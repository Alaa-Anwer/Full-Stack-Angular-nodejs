import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../services/alert.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    loginForm: FormGroup;
    isLoading = false;
    errorMessage = '';
    private returnUrl = '/';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private alertService: AlertService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });

        this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        const authMessage = this.route.snapshot.queryParamMap.get('authMessage');
        if (authMessage) {
            this.errorMessage = authMessage;
            this.alertService.error(authMessage);
        }
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.loginForm.get(fieldName);
        return !!(field && field.touched && field.invalid);
    }

    onSubmit(): void {
        if (this.loginForm.invalid) return;

        this.isLoading = true;
        this.errorMessage = '';

        this.authService.login(this.loginForm.value).subscribe({
            next: (response) => {
                this.authService.setToken(response.data.token, response.data.user);
                this.router.navigateByUrl(this.returnUrl);
            },
            error: (error) => {
                this.errorMessage = error.error?.message || 'Login failed';
                this.isLoading = false;
            }
        });
    }
}
