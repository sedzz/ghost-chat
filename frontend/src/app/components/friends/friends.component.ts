import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../nav/nav.component';
import { Router } from '@angular/router';
import { FriendService } from '../../friend.service';
import { TwNotification, TwNotificationData } from 'ng-tw';
import { Friend} from '../../models/Friend';

interface FriendRequest {
  id: number;
  username: string;
}

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, NavComponent],
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit {
  readonly tabs = ['friends', 'sent', 'received'] as const;
  readonly filters = ['all', 'online', 'offline'] as const;

  friends: Friend[] = [];

  sentRequests: FriendRequest[] = [];

  receivedRequests: FriendRequest[] = [];

  activeTab: 'friends' | 'sent' | 'received' = 'friends';
  statusFilter: 'all' | 'online' | 'offline' = 'all';

  constructor(private router: Router, private friendService : FriendService, private readonly notification: TwNotification) { }

  ngOnInit(): void {
    this.friendService.getSendFriendRequests().subscribe(
      requests => {
        this.sentRequests = requests;
    });
    this.friendService.getReceivedFriendRequests().subscribe(
      requests => {
        this.receivedRequests = requests;
    });
    this.friendService.getFriends().subscribe(
      users => {
        this.friends = users.map(user => ({
          id: user.id,
          username: user.username,
          isOnline: true // Assuming a default value if isOnline is not present
        }));
    });
  }

  setActiveTab(tab: 'friends' | 'sent' | 'received'): void {
    this.activeTab = tab;
  }
  
  setStatusFilter(filter: 'all' | 'online' | 'offline'): void {
    this.statusFilter = filter;
  }

  get filteredFriends(): Friend[] {
    if (this.statusFilter === 'all') return this.friends;
    return this.friends.filter(friend => 
      this.statusFilter === 'online' ? friend.isOnline : !friend.isOnline
    );
  }

  getStatusClass(isOnline: boolean): string {
    return isOnline ? 'text-green-500' : 'text-gray-500';
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }

  acceptFriendRequest(id: Number): void {
    this.friendService.acceptFriendRequest(id).subscribe(
      response => {
        console.log('Friend request accepted:', response);
        // Actualiza la lista de solicitudes recibidas después de aceptar una solicitud
        this.friendService.getReceivedFriendRequests().subscribe(
          requests => {
            this.receivedRequests = requests;
          },
          error => {
            console.error('Error fetching received friend requests:', error);
          }
        );
      },
      error => {
        const notification: TwNotificationData = { type: 'warning', title: 'Error', text: error.error.message };
        this.notification.show(notification);
      }
    );
  }

  rejectFriendRequest(id: Number): void {
    this.friendService.reject_friend_request(id).subscribe(
      response => {
        console.log('Friend request rejected:', response);
        // Actualiza la lista de solicitudes recibidas después de rechazar una solicitud
        this.friendService.getReceivedFriendRequests().subscribe(
          requests => {
            this.receivedRequests = requests;
            const notification: TwNotificationData = { type: 'success', title: 'Success', text: 'User request rejected succesfully' };
            this.notification.show(notification);
          },
          error => {
            const notification: TwNotificationData = { type: 'success', title: 'Success', text: error.error.message };
            this.notification.show(notification);
          }
        );
      },
      error => {
        const notification: TwNotificationData = { type: 'warning', title: 'Error', text: error.error.message };
        this.notification.show(notification);
      }
    );
  }

  cancelFriendRequest(id: Number): void {
    this.friendService.cancel_friend_request(id).subscribe(
      response => {
        console.log('Friend request cancelled:', response);
        // Actualiza la lista de solicitudes enviadas después de cancelar una solicitud
        this.friendService.getSendFriendRequests().subscribe(
          requests => {
            this.sentRequests = requests;
            const notification: TwNotificationData = { type: 'success', title: 'Success', text: 'Friend request cancelled succesfully' };
            this.notification.show(notification);
          },
          error => {
            const notification: TwNotificationData = { type: 'danger', title: 'Error', text: error.error.message };
            this.notification.show(notification);
          }
        );
      },
      error => {
        const notification: TwNotificationData = { type: 'warning', title: 'Error', text: error.error.message };
        this.notification.show(notification);
      }
    );
  }


}
