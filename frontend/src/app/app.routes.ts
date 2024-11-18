import { Routes } from '@angular/router';
import { AuthFormComponent } from './components/auth-form/auth-form.component';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './components/home/home.component';
import { FriendsComponent } from './components/friends/friends.component';
import { ChatComponent } from './components/chat/chat.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
    { path: 'login', component: AuthFormComponent },
    { path : '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'friends', component: FriendsComponent, canActivate: [AuthGuard] },
    { path: 'chat/:roomId', component: ChatComponent },
    { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
    { path: '**', component: HomeComponent }
];
