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

        private _setPath(path: string, attempts: number) {
            if ((window as any).gtag) {
                (window as any).gtag('config', 'UA-118418177-3', {'page_path': path});
                console.log(`GTAG page_path set: ${path}`);
            } else {
                if (attempts > 10) {
                    console.error(`GTAG page_path failed to set: ${path}`);
                    return;
                }
                setTimeout(() => {
                    this._setPath(path, attempts++);
                }, 300);
            }
        }
    }