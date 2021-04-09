import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class ChatbroService {

    private renderer: Renderer2;
    constructor(rendererFactory: RendererFactory2) {
        this.renderer = rendererFactory.createRenderer(null, null);
    }
    
    load() {
        const script = this.renderer.createElement('script');
        const text = this.renderer.createText(`
            function ChatbroLoader(chats, async) { async = !1 !== async; var params = { embedChatsParameters: chats instanceof Array ? chats : [chats], lang: navigator.language || navigator.userLanguage, needLoadCode: 'undefined' == typeof Chatbro, embedParamsVersion: localStorage.embedParamsVersion, chatbroScriptVersion: localStorage.chatbroScriptVersion }, xhr = new XMLHttpRequest; xhr.withCredentials = !0, xhr.onload = function () { eval(xhr.responseText) }, xhr.onerror = function () { console.error('Chatbro loading error') }, xhr.open('GET', '//www.chatbro.com/embed.js?' + btoa(unescape(encodeURIComponent(JSON.stringify(params)))), async), xhr.send() }
            /* Chatbro Widget Embed Code End */
            ChatbroLoader({ encodedChatId: '355Gg' });
        `);

        this.renderer.appendChild(script, text);
        this.renderer.appendChild(document.head, script);
    }
}
