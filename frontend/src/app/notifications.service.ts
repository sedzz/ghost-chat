import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CsrfTokenService } from './csrf-token.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private apiUrl = 'http://localhost:8000/notifications/'; // URL de tu API de Django

  constructor(private http: HttpClient,private csrfTokenService: CsrfTokenService) { }

  getNotifications(): any {
    return this.http.get(`${this.apiUrl}`, { withCredentials: true });
  }


  markAsRead(notificationId: number): Observable<any> {
    const csrfToken = this.csrfTokenService.getCsrfToken();
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || ''
    });

    return this.http.post(`${this.apiUrl}mark-as-read`, { notificationId }, { headers, withCredentials: true });
  }
  
}