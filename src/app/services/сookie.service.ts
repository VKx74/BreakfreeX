import {Injectable} from "@angular/core";

@Injectable()
export class CookieService {

    constructor() {
    }

    public getCookie(name: string) {
        const ca: Array<string> = document.cookie.split(';');
        const caLen: number = ca.length;
        const cookieName = `${name}=`;
        let c: string;

        for (let i = 0; i < caLen; i += 1) {
            c = ca[i].replace(/^\s+/g, '');
            if (c.indexOf(cookieName) === 0) {
                return c.substring(cookieName.length, c.length);
            }
        }
        return '';
    }
    public deleteCookie(name) {
        this.setCookie(name, '', -1);
    }  
    
    public deleteAllCookie() {
        let cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            let eqPos = cookie.indexOf("=");
            let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            this.deleteCookie(name);
        }
    }

    public setCookie(name: string, value: string, expireMinutes: number, path: string = '') {
        const d: Date = new Date();
        d.setTime(d.getTime() + expireMinutes * 60 * 1000);
        const expires = `expires=${d.toUTCString()}`;
        const cpath: string = path ? `; path=${path}` : '';
        document.cookie = `${name}=${value}; ${expires}${cpath}`;
    }
}
