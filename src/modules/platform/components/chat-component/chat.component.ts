import { Component } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { PlatformTranslateService } from "@platform/localization/token";
import { ChatbroService } from '@app/services/traking/ChatbroService';
import { ThemeService } from '@app/services/theme.service';

@Component({
    selector: 'chat-bro',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: PlatformTranslateService
        }
    ]
})
export class ChatBroComponent {
    constructor(private _chatbroService: ChatbroService, private _themeService: ThemeService) {
        let currentTheme = this._themeService.activeTheme;
        this._themeService.activeTheme$.subscribe((theme) => {
            if (currentTheme !== theme) {
                this._chatbroService.loadOnDashboard();
                currentTheme = theme;
            }
        });
    }

    ngAfterViewInit() {
        this.showChat();
    }

    ngOnDestroy() {
        this._chatbroService.cancelLoadingLoadOnDashboard();
    }

    showChat() {
        this._chatbroService.loadOnDashboard();
    }
}
