import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CsrfTokenService } from './csrf-token.service';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketsService {
  private apiUrl = 'ws://localhost:8000/ws/room/'; // + el hash_id de la sala de chat
  chatSocket: WebSocket | undefined;

  constructor(private http: HttpClient, private csrfTokenService: CsrfTokenService) { }

  connectToChatRoom(hash_id: string, onMessageCallback: (data: any) => void): any {
    this.chatSocket = new WebSocket(this.apiUrl + hash_id + '/');

    this.chatSocket.onopen

    this.chatSocket.onclose

    this.chatSocket.onmessage = function (data) {
      const data_message = JSON.parse(data.data);
      onMessageCallback(data_message);
    };
  }

  disconnectFromChatRoom(): void {
    if (this.chatSocket) {
      this.chatSocket.close();
    }
  }

  sendMessage(message: string, type: string = 'text'): void {
    if (this.chatSocket) {
      this.chatSocket.send(JSON.stringify({
        message: message.valueOf().trim(),
        type: type
      }));
    }
  }
}