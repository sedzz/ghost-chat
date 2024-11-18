import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User } from './models/User';
import { CsrfTokenService } from './csrf-token.service';

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  private apiUrl = 'http://localhost:8000/friends/'; // URL de tu API de Django

  constructor(private http: HttpClient, private csrfTokenService: CsrfTokenService) {}

  sendFriendRequest(toUser: string): Observable<any> {
    const csrfToken = this.csrfTokenService.getCsrfToken();
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || ''
    });

    return this.http.post(`${this.apiUrl}send-friend-request`, { to_user: toUser }, { headers, withCredentials: true }).pipe(
      tap(response => {
        console.log('Friend request sent:', response);
      }),
      catchError(this.handleError<any>('sendFriendRequest'))
    );
  }

  getSendFriendRequests(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}list-sent-friend-requests`, { withCredentials: true }).pipe(
      catchError(this.handleError<User[]>('getSendFriendRequests', []))
    );
  }

  getReceivedFriendRequests(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}list-received-friend-requests`, { withCredentials: true }).pipe(
      catchError(this.handleError<User[]>('getReceivedFriendRequests', []))
    );
  }

  acceptFriendRequest(id: Number): Observable<any> {
    const csrfToken = this.csrfTokenService.getCsrfToken();
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || ''
    });
  
    return this.http.post(`${this.apiUrl}accept-friend-request`, { id: id }, { headers, withCredentials: true }).pipe(
      catchError(this.handleError<any>('acceptFriendRequest'))
    );
  }

  getFriends(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}list-friends`, { withCredentials: true }).pipe(
      catchError(this.handleError<User[]>('getFriends', []))
    );
  }

  reject_friend_request(id: Number): Observable<any> {
    const csrfToken = this.csrfTokenService.getCsrfToken();
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || ''
    });

    return this.http.post(`${this.apiUrl}reject-friend-request`, { id: id }, { headers, withCredentials: true }).pipe(
      catchError(this.handleError<any>('rejectFriendRequest'))
    );
  }

  cancel_friend_request(id: Number): Observable<any> {
    const csrfToken = this.csrfTokenService.getCsrfToken();
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || ''
    });

    return this.http.post(`${this.apiUrl}cancel-friend-request`, { id: id }, { headers, withCredentials: true }).pipe(
      catchError(this.handleError<any>('cancelFriendRequest'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      return throwError(error);
    };
  }
}