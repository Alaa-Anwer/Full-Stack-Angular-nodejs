import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    registerForm: FormGroup;
    isLoading = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.registerForm.get(fieldName);
        return !!(field && field.touched && field.invalid);
    }

    onSubmit(): void {
        if (this.registerForm.invalid) return;

        this.isLoading = true;
        this.errorMessage = '';

        this.authService.register(this.registerForm.value).subscribe({
            next: (response) => {
                this.authService.setToken(response.data.token, response.data.user);
                this.router.navigate(['/']);
            },
            error: (error) => {
                this.errorMessage = error.error?.message || 'Registration failed';
                this.isLoading = false;
            }
        });
    }
}
