import {Component} from '@angular/core';
import {ComponentIdentifier} from "@app/models/app-config";
import {ChatModeToken} from "../../mode.token";
import {ChatMode} from "../../enums/chat-mode";
import { MatDialog } from "@angular/material/dialog";
import { CheckoutComponent } from 'modules/BreakfreeTrading/components/checkout/checkout.component';
import { IdentityService } from '@app/services/auth/identity.service';

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

    get hasAccess(): boolean {
        return this._identityService.isAuthorizedCustomer;
    }

    constructor(protected _dialog: MatDialog, protected _identityService: IdentityService) {
    }

    ngOnDestroy(): void {
    }

    processCheckout() {
        this._dialog.open(CheckoutComponent, { backdropClass: 'backdrop-background' });
    }
}

