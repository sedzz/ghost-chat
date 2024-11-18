import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CsrfTokenService {
  getCsrfToken(): string | null {
    const name = 'csrftoken=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].replace(/^\s+/g, '');
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  }
}
