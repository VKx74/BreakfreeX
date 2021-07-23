import {Component, Inject, Injector} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {ChatTranslateService} from "../../localization/token";
import {ComponentIdentifier} from "@app/models/app-config";
import {ChatModeToken} from "../../mode.token";
import {ChatMode} from "../../enums/chat-mode";
import {BaseGoldenLayoutItemComponent} from "@layout/base-golden-layout-item.component";

@Component({
    selector: 'public-chat-widget',
    templateUrl: './public-chat-layout-widget.component.html',
    styleUrls: ['./public-chat-layout-widget.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: ChatTranslateService
        },
        {
            provide: ChatModeToken,
            useValue: ChatMode.PublicThreads
        }
    ]
})
export class PublicChatLayoutWidgetComponent extends BaseGoldenLayoutItemComponent {
    ComponentIdentifier = ComponentIdentifier;

    constructor(@Inject(ChatModeToken) public chatMode: ChatMode,
                protected _translateService: TranslateService,
                protected _injector: Injector) {
        super(_injector);
        this.setTitle(
            this._translateService.stream('publicChatTitle')
        );
    }

    ngOnInit() {
    }

    protected getComponentState(): any {
        return {};
    }

    protected useLinker(): boolean {
        return false;
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
