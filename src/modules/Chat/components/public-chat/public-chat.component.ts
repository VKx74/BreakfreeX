import {Component} from '@angular/core';
import {ComponentIdentifier} from "@app/models/app-config";
import {ChatModeToken} from "../../mode.token";
import {ChatMode} from "../../enums/chat-mode";
import { MatDialog } from "@angular/material/dialog";
import { CheckoutComponent } from 'modules/BreakfreeTrading/components/checkout/checkout.component';
import { IdentityService } from '@app/services/auth/identity.service';
import { UserSettingsService } from '@app/services/user-settings/user-settings.service';

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
    public chatPolicyAccepted: boolean = true;

    ComponentIdentifier = ComponentIdentifier;

    get hasAccess(): boolean {
        return true; // all user can see, just with subscriptions can message
        return this._identityService.isAuthorizedCustomer;
    }
    
    get hasEarlyAccess(): boolean {
        return this._identityService.isChatAllowed;
    }

    constructor(protected _dialog: MatDialog, protected _identityService: IdentityService, protected _userSettingsService: UserSettingsService) {
        _userSettingsService.getSettings().subscribe((s) => {
            this.chatPolicyAccepted = !!s.chatPolicyAccepted;
        });
    }

    ngOnDestroy(): void {
    }

    processCheckout() {
        this._dialog.open(CheckoutComponent, { backdropClass: 'backdrop-background' });
    }

    acceptRule() {
        this._userSettingsService.saveSettings({
            chatPolicyAccepted: true
        }, true).subscribe();

        this.chatPolicyAccepted = true;
    }
}

