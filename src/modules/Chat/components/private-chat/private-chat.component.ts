import {Component} from '@angular/core';
import {ComponentIdentifier} from "@app/models/app-config";
import {ChatModeToken} from "../../mode.token";
import {ChatMode} from "../../enums/chat-mode";

@Component({
    selector: 'private-chat',
    templateUrl: './private-chat.component.html',
    styleUrls: ['./private-chat.component.scss'],
    providers: [
        {
            provide: ChatModeToken,
            useValue: ChatMode.PrivateThreads
        }
    ]
})
export class PrivateChatComponent {
    ComponentIdentifier = ComponentIdentifier;

    ngOnDestroy(): void {
    }
}

