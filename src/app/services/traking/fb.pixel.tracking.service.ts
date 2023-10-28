import { Injectable } from '@angular/core';

    @Injectable({
        providedIn: 'root'
    })
    export class FBPixelTrackingService {
        constructor() { }
        load() {
            (function (f: any, b, e, v, n, t, s) {
                if (f.fbq) return; n = f.fbq = function () {
                    n.callMethod ?
                        n.callMethod.apply(n, arguments) : n.queue.push(arguments);
                }; if (!f._fbq) f._fbq = n;
                n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = true;
                t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
            })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
            (window as any).fbq.disablePushState = true; // not recommended, but can be done
            (window as any).fbq('init', '1307342416649933');
        }
    }