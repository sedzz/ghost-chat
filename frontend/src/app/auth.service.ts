import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from './models/User';
import { CsrfTokenService } from './csrf-token.service';

interface LoginResponse {
  user: {
    id: number;
    username: string;
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  getCsrfToken() {
    throw new Error('Method not implemented.');
  }
  private apiUrl = 'http://localhost:8000/auth/'; // URL de tu API de Django
  private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(private http: HttpClient, private csrfTokenService: CsrfTokenService) { }

  register(email: string, username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}register`, { email, username, password });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<LoginResponse>(`${this.apiUrl}login`, { email, password }, { withCredentials: true }).pipe(
      tap(response => {
        if (response) {
          const user = new User(response.user.id, response.user.username);
          this.setUser(user);
        }
      })
    );
  }
  
  checkAuth(): Observable<any> {
    return this.http.get<LoginResponse>(`${this.apiUrl}check-auth`, { withCredentials: true }).pipe(
      tap(response => {
        if (response && response.user) {
          const user = new User(response.user.id, response.user.username);
          this.setUser(user);
        } else {
          this.setUser(null);
        }
      })
    );
  }

  checkFullAuth(): Observable<any> {
    return this.http.get<LoginResponse>(`${this.apiUrl}check-full-auth`, { withCredentials: true }).pipe(
      tap(response => {
        if (response && response.user) {
          const user = new User(response.user.id, response.user.username);
          this.setUser(user);
        } else {
          this.setUser(null);
        }
      })
    );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    const csrfToken = this.csrfTokenService.getCsrfToken();
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || ''
    });
    
    return this.http.put(`${this.apiUrl}change-password`, { oldPassword, newPassword }, { headers, withCredentials: true });
  }

  logout(): Observable<any> {
    const csrfToken = this.csrfTokenService.getCsrfToken();
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || ''
    });
    return this.http.post(`${this.apiUrl}logout`, {}, { headers, withCredentials: true })
  }

  private setUser(user: User | null): void {
    this.userSubject.next(user);
  }
}