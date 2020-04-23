import {Component} from '@angular/core';
import {ComponentIdentifier} from "@app/models/app-config";
import {ChatModeToken} from "../../mode.token";
import {ChatMode} from "../../enums/chat-mode";

@Component({
    selector: 'public-chat',
    templateUrl: './public-chat.component.html',
    styleUrls: ['./public-chat.component.scss'],
    providers: [
        {
            provide: ChatModeToken,
            useValue: ChatMode.PublicThreads
        }
    ]
})
export class PublicChatComponent {
    ComponentIdentifier = ComponentIdentifier;

    ngOnDestroy(): void {
    }
}

