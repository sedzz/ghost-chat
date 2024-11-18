import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../chat.service';
import { AuthService } from '../../auth.service';
import { User } from '../../models/User';
import { WebSocketsService } from '../../websockets.service';
import { TwNotification, TwNotificationData } from 'ng-tw';
import * as CryptoJS from 'crypto-js';

interface Message {
  sender: string;
  content: string;
  timestamp: string;
  type: string; // Add type to distinguish between text and image messages
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {  
  @ViewChild('chatBody') private chatBody!: ElementRef;
  user: User | null = null;
  isLoggedIn: boolean = false;
  username = "";
  messages: Message[] = [];
  message: string = '';
  roomName: string = '';
  selectedFile: File | null = null; // Add selectedFile to store the selected image file

  hash_id: string | undefined;
  
  // Usar la clave generada
  encryptionKey = "2=U8!^TsYj+=~K`2zr#Uv$<M27M?{v!9wWk&-Aq`1'~_$P.y'm";

  // Properties for modal
  isModalOpen: boolean = false;
  modalImage: string = '';

  constructor(
    private chat: ChatService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private socket: WebSocketsService,
    private readonly notification: TwNotification // Inyecta el servicio de notificaciones
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(
      user => {
        this.user = user;
      }
    );
    this.authService.checkAuth().subscribe();

    this.hash_id = this.route.snapshot.paramMap.get('roomId') ?? undefined;
    if (this.hash_id) {
      this.chat.getChatRoom(this.hash_id).subscribe(
        (data) => {
          this.roomName = data.chat_room.name;
        },
        (error) => {
          this.router.navigate(['/']);
        }
      );
    } else {
      this.router.navigate(['/']);
      return;
    }

    this.socket.connectToChatRoom(this.hash_id, this.onMessageReceived.bind(this));
  }

  private encryptMessage(message: string): string {
    return CryptoJS.AES.encrypt(message, this.encryptionKey).toString();
  }

  private decryptMessage(encryptedMessage: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  sendMessage(message: string): void {
    if (!message.trim() && !this.selectedFile) {
      // No enviar si el mensaje está vacío y no hay imagen seleccionada
      return;
    }

    if (this.selectedFile) {
      this.sendImageMessage();
    } else {
      const encryptedMessage = this.encryptMessage(message);
      this.socket.sendMessage(encryptedMessage);
      const newMessage: Message = {
        sender: this.user?.username || 'Unknown',
        content: message,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      this.message = ''; // Limpiar el campo de entrada después de enviar el mensaje
    }
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        // Mostrar notificación de imagen cargada
        const notification: TwNotificationData = {
          type: 'success',
          title: 'Imagen cargada',
          text: 'La imagen se ha cargado correctamente.'
        };
        this.notification.show(notification);
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  sendImageMessage(): void {
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result as string;
        const encryptedImage = this.encryptMessage(base64Image);
        this.socket.sendMessage(encryptedImage, 'image');
        const newMessage: Message = {
          sender: this.user?.username || 'Unknown',
          content: base64Image,
          timestamp: new Date().toISOString(),
          type: 'image'
        };
        this.selectedFile = null;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  private onMessageReceived(data: any): void {
    if (data.username === 'System') {
      const notification: TwNotificationData = {
        type: 'info',
        title: 'System',
        text: data.message
      };
      this.notification.show(notification);
    } else {
      const decryptedMessage = this.decryptMessage(data.message);
      const newMessage: Message = {
        sender: data.username,
        content: decryptedMessage,
        timestamp: data.datetime,
        type: data.type || 'text' // Default to 'text' if type is not provided
      };
      this.messages.push(newMessage);
    }
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
  }

  navigateHome(): void {
    this.socket.disconnectFromChatRoom();
    this.router.navigate(['/']);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  // Methods for modal
  openModal(imageSrc: string): void {
    this.modalImage = imageSrc;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }
}