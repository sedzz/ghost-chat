import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CsrfTokenService } from './csrf-token.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:8000/chat/'; // URL de tu API de Django

  constructor(private http: HttpClient, private csrfTokenService: CsrfTokenService) { }


  createRoom(room_name: string, other_user_id: number): Observable<any> {
    const csrfToken = this.csrfTokenService.getCsrfToken();
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || ''
    });

    return this.http.post(`${this.apiUrl}create-chat-room/`, { room_name, other_user_id }, { headers, withCredentials: true }).pipe(
      catchError(this.handleError<any>('createRoom'))
    );
  }

  getChatRooms(): Observable<any> {
    return this.http.get(`${this.apiUrl}get-rooms/`, { withCredentials: true }).pipe(
      catchError(this.handleError<any>('getChatRooms'))
    );
  }

  getChatRoom(hash_id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}room/${hash_id}/`, { withCredentials: true }).pipe(
      catchError(this.handleError<any>('getChatRoom'))
    );
  }

  deleteChatRoom(hash_id: string): Observable<any> {
    const csrfToken = this.csrfTokenService.getCsrfToken();
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || ''
    });

    return this.http.delete(`${this.apiUrl}room/${hash_id}/delete/`, { headers, withCredentials: true }).pipe(
      catchError(this.handleError<any>('deleteChatRoom'))
    );
  }
  
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      return throwError(error);
    };
  }
}