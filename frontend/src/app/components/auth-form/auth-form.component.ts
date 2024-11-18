import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../auth.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  providers: [AuthService, CookieService]
})
export class AuthFormComponent {
  isLogin = true;
  authForm: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(private router: Router, private fb: FormBuilder, private authService: AuthService, private cookieService: CookieService) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      username: [''],
      confirmPassword: ['']
    });
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
    if (this.isLogin) {
      this.authForm.removeControl('confirmPassword');
    } else {
      this.authForm.addControl('confirmPassword', this.fb.control('', Validators.required));
    }
  }

  onSubmit() {
    if (this.authForm.valid) {
      const { email, password, username } = this.authForm.value;
      if (this.isLogin) {
        this.authService.login(email, password).subscribe(
          response => {
            this.router.navigate(['/']);
          },
          error => {
            this.errorMessage = error.error.error || 'Error . Email o contraseña incorrectos';
          }
        );
      } else {
        if (password !== this.authForm.get('confirmPassword')?.value) {
          this.errorMessage = 'Las contraseñas no coinciden';
          return;
        }
        this.authService.register(email, username, password).subscribe(
          response => {
            this.successMessage = 'Registro exitoso, mira tu email para completar el registro';
            // this.router.navigate(['/login']); puede que lo haga nose
          },
          error => {
            this.errorMessage = error.error.error || 'Error en el registro, intentelo de nuevo';
          }
        );
      }
    }
  }
}
