import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter, Input,
    OnInit,
    Output,
    TemplateRef
} from '@angular/core';
import {IdentityService} from "@app/services/auth/identity.service";
import {BrokerService} from "@app/services/broker.service";
import {OandaBrokerService} from "@app/services/oanda.exchange/oanda.broker.service";
import {UserAvatarShape} from "../../../UI/components/name-avatar/name-avatar.component";
import {ApplicationTypeService} from "@app/services/application-type.service";
import {ApplicationType} from "@app/enums/ApplicationType";
import {OandaTradingAccount} from "../../../Trading/models/forex/oanda/oanda.models";
import {ICryptoUserInfo} from "../../../Trading/models/crypto/crypto.models";
import {Observable} from "rxjs";
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";
import {TranslateService} from "@ngx-translate/core";
import {AppTranslateService} from "@app/localization/token";

@Component({
    selector: 'user-info-menu',
    templateUrl: './user-info-menu.component.html',
    styleUrls: ['./user-info-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: TranslateService,
            useExisting: AppTranslateService
        }
    ]
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserInfoMenuComponent implements OnInit {
    @Input() avatarTemplate: TemplateRef<any>;
    activeBroker$ = this._brokerService.activeBroker$ as Observable<CryptoBroker | OandaBrokerService>;
    applicationType$ = this._appTypeService.applicationTypeChanged;
    UserAvatarShape = UserAvatarShape;
    ApplicationType = ApplicationType;
    userName = this._identity.preferredUsername;
    userId = this._identity.id;
    // TODO: Adjust for Crypto type app
    // userInfo: OandaTradingAccount | ICryptoUserInfo;
    @Output() logOut = new EventEmitter();

    constructor(private _identity: IdentityService,
                private _appTypeService: ApplicationTypeService,
                private _cdRef: ChangeDetectorRef,
                private _brokerService: BrokerService) {
    }

    ngOnInit() {
        // this._brokerService
        //     .activeBroker$
        //     .subscribe(broker => {
        //         if (broker) {
        //             this.userInfo = broker.userInfo;
        //         }
        //     });
    }

    onLogoutClick() {
        this.logOut.emit();
    }
}
