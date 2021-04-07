import { Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class ChatbroService {
    constructor() { }
    load() {
        if ((window as any).gtag) {
            return;
        }

        (function () {
            function ChatbroLoader(chats, async) {
                async = !1 !== async; 
                let params = { embedChatsParameters: chats instanceof Array ? chats : [chats], lang: navigator.language || (navigator as any).userLanguage, needLoadCode: 'undefined' === typeof((window as any).Chatbro), embedParamsVersion: localStorage.embedParamsVersion, chatbroScriptVersion: localStorage.chatbroScriptVersion }, xhr = new XMLHttpRequest; xhr.withCredentials = !0, xhr.onload = function () { eval(xhr.responseText); }, xhr.onerror = function () { console.error('Chatbro loading error'); }, xhr.open('GET', '//www.chatbro.com/embed.js?' + btoa(unescape(encodeURIComponent(JSON.stringify(params)))), async), xhr.send();
            }
            /* Chatbro Widget Embed Code End */
            ChatbroLoader({ encodedChatId: '355Gg' }, false);
        })();
    }
}
