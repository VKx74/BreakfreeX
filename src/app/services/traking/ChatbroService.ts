import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { ThemeService } from '../theme.service';
import { Theme } from '@app/enums/Theme';


@Injectable({
    providedIn: 'root'
})
export class ChatbroService {
    private renderer: Renderer2;
    private interval: any;

    constructor(private rendererFactory: RendererFactory2, private  themeService: ThemeService) {
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

    cancelLoadingLoadOnDashboard() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    
    loadOnDashboard() {
        let w = window as any;

        if (!w.ChatbroLoader) {
            const script = this.renderer.createElement('script');
            const text = this.renderer.createText(`
                function ChatbroLoader(chats, async) { async = !1 !== async; var params = {embedChatsParameters: chats instanceof Array ? chats : [chats], lang: navigator.language || navigator.userLanguage, needLoadCode: 'undefined' == typeof Chatbro, embedParamsVersion: localStorage.embedParamsVersion, chatbroScriptVersion: localStorage.chatbroScriptVersion }, xhr = new XMLHttpRequest; xhr.withCredentials = !0, xhr.onload = function () { eval(xhr.responseText) }, xhr.onerror = function () { console.error('Chatbro loading error') }, xhr.open('GET', '//www.chatbro.com/embed.js?' + btoa(unescape(encodeURIComponent(JSON.stringify(params)))), async), xhr.send() }
            `);

            this.renderer.appendChild(script, text);
            this.renderer.appendChild(document.head, script);
        }

        let theme = this.themeService.getActiveTheme();

        this.interval = setInterval(() => {
            if (w.ChatbroLoader) {
                w.ChatbroLoader({
                    isStatic: true,
                    allowResizeChat: false,
                    allowMinimizeChat: false,
                    coloredUserNames: true,
                    messageFontSise: 11,
                    chatHeaderBackgroundColor: "#121219",
                    chatHeaderTextColor: "#FFFFFF",
                    chatBodyBackgroundColor: theme === Theme.Light ? "#FFFFFF" : "#212125",
                    chatInputBackgroundColor: theme === Theme.Light ? "#FFFFFF" : "#212125",
                    chatBodyTextColor: theme === Theme.Light ? "#121212" : "#EEEEEE",
                    chatInputTextColor: theme === Theme.Light ? "#121212" : "#EEEEEE",
                    chatAdminBodyTextColor: theme === Theme.Light ? "#121212" : "#EEEEEE",
                    chatModerBodyTextColor: theme === Theme.Light ? "#121212" : "#EEEEEE",
                    containerDivId: "chat-container",
                    chatState: "maximized",
                    chatHeight: "100%",
                    chatWidth: "100%",
                    encodedChatId: '78v62',
                    chatTopLeftBorderRadius: "0px",
                    chatTopRightBorderRadius: "0px",
                    chatBottomLeftBorderRadius: "0px",
                    chatBottomRightBorderRadius: "0px",
                });
                clearInterval(this.interval);
                this.interval = null;
            }
        }, 300);
    }
}
