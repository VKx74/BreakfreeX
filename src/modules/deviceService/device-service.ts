import { Injectable } from '@angular/core';
import {CookieService} from "@app/services/сookie.service";



@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor(private cookieService: CookieService) { }

  isFirstTimeLogin(): boolean {
    const cookieValue: string = this.cookieService.getCookie('firstTimeLogin');
    if (cookieValue === 'true') {
      // The user has already seen the popup, so return false
      return false;
    } else {
      // The user hasn't seen the popup yet, so set the cookie to 'true' and return true
      this.cookieService.setCookie('firstTimeLogin', 'true', 365 * 24 * 60); // Set the cookie to expire in 1 year
      return true;
    }
  }

}
