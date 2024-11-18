import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { FriendService } from '../../../friend.service';
import { ChatService } from '../../../chat.service'; // Importa ChatService
import { Friend } from '../../../models/Friend';

@Component({
  selector: 'app-private-chat-modal',
  standalone: true,
  imports: [CommonModule, FormsModule], // Agrega FormsModule a la lista de importaciones
  templateUrl: './private-chat-modal.component.html',
  styleUrls: ['./private-chat-modal.component.scss'] // Corrige el nombre de la propiedad
})
export class PrivateChatModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  friends: Friend[] = [];
  selectedFriendId: string = ''; // Almacena el ID del amigo seleccionado
  roomName: string = ''; // Almacena el nombre de la sala

  constructor(
    private friendService: FriendService,
    private chatService: ChatService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.friendService.getFriends().subscribe(
      users => {
        this.friends = users.map(user => ({
          id: user.id,
          username: user.username,
          isOnline: true // Assuming a default value if isOnline is not present
        }));
      }
    );
  }

  closeModal() {
    this.close.emit();
  }

  createRoom() {
    const selectedFriend = this.friends.find(friend => friend.id === Number(this.selectedFriendId));
    if (selectedFriend) {
      this.chatService.createRoom(this.roomName,selectedFriend.id).subscribe(
        response => {
          this.closeModal();
        },
        error => {
          console.error('Error creating room:', error);
        }
      );
    }
  }
}