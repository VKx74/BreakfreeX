import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class GTMTrackingService {
    constructor() { }
    load() {
        if ((window as any).gtag) {
            return;
        }

        (function (w, d, s, l, i) {
            w[l] = w[l] || []; w[l].push({
                'gtm.start':
                    new Date().getTime(), event: 'gtm.js'
            }); let f = d.getElementsByTagName(s)[0],
                j = d.createElement(s) as any, dl = l !== 'dataLayer' ? '&l=' + l : ''; j.async = true;
            j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', 'GTM-TNPBKC9');
    }

    setPath(path: string) {
        this._setPath(path, 0);
    }

    processRegistration(path: string) {
        this._processRegistration(path, 0);
    }

    guestRegistration() {
        this._setPath("guest-registered", 0);
    }

    private _processRegistration(path: string, attempts: number) {
        if ((window as any).gtag) {
            (window as any).gtag('config', 'UA-118418177-3', { 'page_path': path });
            console.log(`GTAG page_path set: ${path}`);
            (window as any).gtag('event', 'conversion', { 'send_to': 'AW-709599471/4OPfCPD94PcBEO_BrtIC' });
            console.log(`GTAG conversion sent`);
        } else {
            if (attempts > 10) {
                console.error(`GTAG failed to load`);
                return;
            }
            setTimeout(() => {
                this._processRegistration(path, attempts++);
            }, 300);
        }
    }

    // private _guestRegistration(path: string, attempts: number) {
    //     if ((window as any).gtag) {
    //         (window as any).gtag('config', 'UA-118418177-3', { 'page_path': path });
    //         console.log(`GTAG page_path set: ${path}`);
    //     } else {
    //         if (attempts > 10) {
    //             console.error(`GTAG failed to load`);
    //             return;
    //         }
    //         setTimeout(() => {
    //             this._processRegistration(path, attempts++);
    //         }, 300);
    //     }
    // }

    private _setPath(path: string, attempts: number) {
        if ((window as any).gtag) {
            (window as any).gtag('config', 'UA-118418177-3', { 'page_path': path });
            console.log(`GTAG page_path set: ${path}`);
        } else {
            if (attempts > 10) {
                console.error(`GTAG failed to load`);
                return;
            }
            setTimeout(() => {
                this._processRegistration(path, attempts++);
            }, 300);
        }
    }
}

