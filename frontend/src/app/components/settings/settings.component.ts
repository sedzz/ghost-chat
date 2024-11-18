import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { User } from '../../models/User';
import { format } from 'date-fns';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TwNotification, TwNotificationData } from 'ng-tw';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  user: User | null = null;
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private authService: AuthService, private router: Router, private readonly notification: TwNotification) { }

  ngOnInit(): void {
    this.authService.checkFullAuth().subscribe((response: { user: User }) => {
      this.user = response.user;
      console.log(this.user);
    });
  }

  formatDate(dateString: Date): string {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm:ss');
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }

  changePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      const notification : TwNotificationData = {
        type: 'danger',
        title: 'Error',
        text: 'Las contraseñas no coinciden'
      };
      this.notification.show(notification);
      return;
    }

    if (this.currentPassword === this.newPassword) {
      const notification : TwNotificationData = {
        type: 'danger',
        title: 'Error',
        text: 'La nueva contraseña no puede ser la misma que la actual'
      };
      this.notification.show(notification);
      return;
    }

    this.authService.changePassword(this.currentPassword, this.newPassword).subscribe(
      response => {
        const notification : TwNotificationData = {
          type: 'success',
          title: 'Contraseña cambiada',
          text: 'La contraseña se ha cambiado correctamente'
        };
        this.notification.show(notification);
        this.navigateHome();
      },
      error => {
        const notification : TwNotificationData = {
          type: 'danger',
          title: 'Error',
          text: 'La contraseña actual no es correcta'
        };
        this.notification.show(notification);
      }
    );
  }
}