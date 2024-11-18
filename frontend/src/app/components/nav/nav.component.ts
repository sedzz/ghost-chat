import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../models/User';
import { AuthService } from '../../auth.service';
import { FriendService } from '../../friend.service';
import { TwNotification, TwNotificationData } from 'ng-tw';
import { Router } from '@angular/router';
import { NotificationsService } from '../../notifications.service';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: number;
  message: string;
  time: Date;
  type: string;
}


@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent implements OnInit {
  user: User | null = null;
  isDropdownOpen = false;
  isProfileDropdownOpen = false;
  isNotificationsDropdownOpen = false;
  profileInitial: string | undefined;
  profileColor: string | undefined;

  userNickname: string = '';

  notifications: Notification[] = [];
  chatsActivos: any[] = [];

  constructor(private authService: AuthService, private friendService: FriendService, private readonly notification: TwNotification, private router: Router, private notificationService: NotificationsService) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      if (this.user) {
        this.profileInitial = this.user.username.charAt(0).toUpperCase();
        this.profileColor = this.generateColorFromUsername(this.user.username);
      }
    });

    this.authService.checkAuth().subscribe();
    
    this.notificationService.getNotifications().subscribe((notifications: any[]) => {
      this.notifications = notifications.map(notification => {
        return {
          ...notification,
          time: formatDistanceToNow(new Date(notification.time), { addSuffix: true })
        };
      });
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.closeDropdowns();
    }
  }

  closeDropdowns() {
    this.isDropdownOpen = false;
    this.isProfileDropdownOpen = false;
    this.isNotificationsDropdownOpen = false;
  }

  markAsRead(notificationId: number) {
    this.notifications = this.notifications.filter(noti => noti.id !== notificationId);
    this.notificationService.markAsRead(notificationId).subscribe();
  }

  markAllAsRead() {
    this.notifications = [];
  }

  generateColorFromUsername(username: string): string {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleProfileDropdown() {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  toggleNotificationsDropdown() {
    this.isNotificationsDropdownOpen = !this.isNotificationsDropdownOpen;
  }

  onSubmit() {
    if (this.userNickname) {
      this.friendService.sendFriendRequest(this.userNickname).subscribe(
        response => {
          const notification: TwNotificationData = { type: 'success', title: 'Success', text: 'Friend request sent successfully' };
          this.notification.show(notification);
        },
        error => {
          const notification: TwNotificationData = { type: 'danger', title: 'Error', text: error.error.message };
          this.notification.show(notification);
        }
      );
    } else {
      const notification: TwNotificationData = { type: 'warning', title: 'Error', text: 'An error has occurred!' };
      this.notification.show(notification);
    }
  }

  navigateToFriends() {
    this.router.navigate(['/friends']);
  }

  navigateToSettings() {
    this.router.navigate(['/settings']);
  }

  logout() {
    this.authService.logout().subscribe();
    this.router.navigate(['/login']);
  }
}