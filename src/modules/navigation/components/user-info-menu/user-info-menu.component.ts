import {
    Component,
    EventEmitter, Input,
    OnInit,
    Output,
    TemplateRef
} from '@angular/core';
import { IdentityService } from "@app/services/auth/identity.service";
import { BrokerService } from "@app/services/broker.service";
import { UserAvatarShape } from "../../../UI/components/name-avatar/name-avatar.component";
import { Subject, Subscription } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { AppTranslateService } from "@app/localization/token";
import { TradingProfileService } from 'modules/BreakfreeTrading/services/tradingProfile.service';
import { MatDialog } from "@angular/material/dialog";
import { ConfirmModalComponent } from 'modules/UI/components/confirm-modal/confirm-modal.component';
import { Store } from "@ngrx/store";
import { AppState } from "@app/store/reducer";
import { ResetLayoutAction } from '@app/store/actions/platform.actions';
import { MissionsComponent } from 'modules/BreakfreeTrading/components/missions/missions.component';


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
    activeBroker$ = this._brokerService.activeBroker$;
    UserAvatarShape = UserAvatarShape;
    userName = this._identity.preferredUsername;
    userId = this._identity.id;
    @Output() logOut = new EventEmitter();

    public get score(): number {
        return this._tradingProfileService.score;
    } 
    
    public get isAuthorizedCustomer(): boolean {
        return this._identity.isAuthorizedCustomer;
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
        private _dialog: MatDialog,
        private _store: Store<AppState>,
        private _tradingProfileService: TradingProfileService,
        private _brokerService: BrokerService) {
    }

    ngAfterViewInit() {
       this._subscriptionToMenuOpen = this.opened.subscribe(() => {
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
        let scrHeight = window.innerHeight;
        this._dialog.open(MissionsComponent, { backdropClass: 'backdrop-background', position: {
            top: scrHeight > 667 ? "100px" : null
        }});
    } 

    private _resetLayout() {
        this._store.dispatch(new ResetLayoutAction());
    }
}
