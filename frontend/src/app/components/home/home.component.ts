import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { CookieService } from 'ngx-cookie-service';
import { NavComponent } from '../nav/nav.component';
import { PrivateChatModalComponent } from '../modals/private-chat-modal/private-chat-modal.component';
import { ChatService } from '../../chat.service';
import { TwNotification, TwNotificationData } from 'ng-tw';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavComponent, PrivateChatModalComponent],
  providers: [AuthService, CookieService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  constructor(private authService: AuthService, private chat: ChatService, private readonly notification: TwNotification) { }

  showModal = false;
  chatsActivos: { name: string, hash_id: string }[] = [];
  showDeleteModal: boolean = false;
  chatToDelete: string | null = null;


  ngOnInit(): void {
    this.chat.getChatRooms().subscribe((data) => {
      this.chatsActivos = data.chat_rooms;
    });
  }

  toggleModal() {
    this.showModal = !this.showModal;
    if (!this.showModal) {
      this.chat.getChatRooms().subscribe((data) => {
        this.chatsActivos = data.chat_rooms;
      });
    }
  }

  goToChat(hash_id: string) {
    console.log(hash_id);
    window.location.href = `/chat/${hash_id}`;
  }

  openDeleteModal(chatId: string) {
    this.chatToDelete = chatId;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.chatToDelete = null;
  }

  confirmDelete() {
    if (this.chatToDelete) {
      this.deleteChat(this.chatToDelete);
      this.closeDeleteModal();
    }
  }

  deleteChat(hash_id: string) {
    this.chat.deleteChatRoom(hash_id).subscribe(() => {
      this.chatsActivos = this.chatsActivos.filter(chat => chat.hash_id !== hash_id);
      const notification : TwNotificationData = {
        type: 'success',
        title: 'Chat eliminado exitosamente'
      };
      this.notification.show(notification);
    });
  }
}