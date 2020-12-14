import {
    Component,
    EventEmitter, Input,
    OnInit,
    Output,
    TemplateRef
} from '@angular/core';
import { IdentityService } from "@app/services/auth/identity.service";
import { BrokerService } from "@app/services/broker.service";
import { OandaBrokerService } from "@app/services/oanda.exchange/oanda.broker.service";
import { UserAvatarShape } from "../../../UI/components/name-avatar/name-avatar.component";
import { ApplicationTypeService } from "@app/services/application-type.service";
import { ApplicationType } from "@app/enums/ApplicationType";
import { Observable, Subject, Subscription } from "rxjs";
import { CryptoBroker } from "@app/interfaces/broker/crypto.broker";
import { TranslateService } from "@ngx-translate/core";
import { AppTranslateService } from "@app/localization/token";
import { TradingProfileService } from 'modules/BreakfreeTrading/services/tradingProfile.service';
import { MatDialog } from "@angular/material/dialog";
import { ConfirmModalComponent } from 'modules/UI/components/confirm-modal/confirm-modal.component';
import { Store } from "@ngrx/store";
import { AppState } from "@app/store/reducer";
import { ResetLayoutAction } from '@app/store/actions/platform.actions';
import { MissionsComponent } from 'modules/BreakfreeTrading/components/missions/missions.component';
import { UsersProfileService } from "@app/services/users-profile.service";


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
    private _workspacesSubscription: Subscription;
    private _subscriptionToMenuOpen: Subscription;

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

    public get levelName(): string {
        return this._tradingProfileService.levelName || "";
    }

    public get isLoaded(): boolean {
        return !!this._tradingProfileService.missions;
    }

    public get scoreForLevel(): number {
        return this._tradingProfileService.scoreForLevel;
    }

    public get level(): number {
        return this._tradingProfileService.level;
    }

    constructor(private _identity: IdentityService,
        private _appTypeService: ApplicationTypeService,
        private _dialog: MatDialog,
        private _store: Store<AppState>,
        private _tradingProfileService: TradingProfileService,
        private _usersProfileService: UsersProfileService,
        private _brokerService: BrokerService) {
    }

    ngAfterViewInit() {
       this._subscriptionToMenuOpen = this.opened.subscribe(() => {
            this._tradingProfileService.updateMissions();
       });
    }

    ngOnInit() {

    }

    onLogoutClick() {
        this.logOut.emit();
    }

    resetLayout() {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                title: 'Reset layout',
                message: `Do you want to reset your workspace?`,
                onConfirm: () => {
                    this._resetLayout();
                }
            }
        });
    }

    ngOnDestroy() {
        if (this._workspacesSubscription) {
            this._workspacesSubscription.unsubscribe();
            this._workspacesSubscription = null;
        }

        if (this._subscriptionToMenuOpen) {
            this._subscriptionToMenuOpen.unsubscribe();
            this._subscriptionToMenuOpen = null;
        }
    }

    openMissionDialog() {
        this._dialog.open(MissionsComponent, { backdropClass: 'backdrop-background' });
    } 

    getLevelStyleClassName(): string {
        switch (this.levelName.toLowerCase()) {
            case "bronze": return "bronze-rank";
            case "silver": return "silver-rank";
            case "gold": return "gold-rank";
            case "platinum": return "platinum-rank";
            case "master": return "master-rank";
            case "legend": return "legend-rank";
            default: return "";
        }
    }

    private _resetLayout() {
        this._store.dispatch(new ResetLayoutAction());
    }
}
