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
import {Observable, Subject} from "rxjs";
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";
import {TranslateService} from "@ngx-translate/core";
import {AppTranslateService} from "@app/localization/token";
import { TradingProfileService } from 'modules/BreakfreeTrading/services/tradingProfile.service';

@Component({
    selector: 'user-info-menu',
    templateUrl: './user-info-menu.component.html',
    styleUrls: ['./user-info-menu.component.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush,
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
    @Input() opened: Subject<void>;
    activeBroker$ = this._brokerService.activeBroker$ as Observable<CryptoBroker | OandaBrokerService>;
    applicationType$ = this._appTypeService.applicationTypeChanged;
    UserAvatarShape = UserAvatarShape;
    ApplicationType = ApplicationType;
    userName = this._identity.preferredUsername;
    userId = this._identity.id;
    @Output() logOut = new EventEmitter();

    public get score(): number {
        return this._tradingProfileService.score;
    }

    public get scoreForLevel(): number {
        return this._tradingProfileService.scoreForLevel;
    }

    public get level(): number {
        return this._tradingProfileService.level;
    }

    constructor(private _identity: IdentityService,
                private _appTypeService: ApplicationTypeService,
                private _tradingProfileService: TradingProfileService,
                private _brokerService: BrokerService) {
        this._tradingProfileService.updateTradingProfile();
    }

    ngAfterViewInit() {
        if (this.opened) {
            this.opened.subscribe(() => {
                this._tradingProfileService.updateTradingProfile();
            });
        }
    }

    ngOnInit() {
       
    }

    onLogoutClick() {
        this.logOut.emit();
    }
}
