import {Component, Injector} from '@angular/core';
import {ComponentIdentifier} from "@app/models/app-config";
import {ChatModeToken} from "../../mode.token";
import {ChatMode} from "../../enums/chat-mode";
import {TranslateService} from "@ngx-translate/core";
import {BaseLayoutItemComponent} from "@layout/base-layout-item.component";
import {ChatTranslateService} from "../../localization/token";

@Component({
    selector: 'private-chat-widget',
    templateUrl: './private-chat-layout-widget.component.html',
    styleUrls: ['./private-chat-layout-widget.component.scss'],
    providers: [
        {
            provide: ChatModeToken,
            useValue: ChatMode.PrivateThreads
        },
        {
            provide: TranslateService,
            useExisting: ChatTranslateService
        }
    ]
})
export class PrivateChatLayoutWidgetComponent extends BaseLayoutItemComponent {
    ComponentIdentifier = ComponentIdentifier;

    constructor(protected _translateService: TranslateService,
                protected _injector: Injector) {
        super(_injector);
        this.setTitle(
            this._translateService.stream('privateChatTitle')
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

