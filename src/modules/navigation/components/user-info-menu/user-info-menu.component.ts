import {
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
import {Observable, Subject, Subscription} from "rxjs";
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";
import {TranslateService} from "@ngx-translate/core";
import {AppTranslateService} from "@app/localization/token";
import { TradingProfileService } from 'modules/BreakfreeTrading/services/tradingProfile.service';
import { WorkspaceRepository } from '@platform/services/workspace-repository.service';
import { Workspace } from '@platform/data/workspaces';
import { LayoutManagerService } from "angular-golden-layout";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmModalComponent } from 'modules/UI/components/confirm-modal/confirm-modal.component';

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
    private _workspaces: Workspace[];
    
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
                private _workspaceRepository: WorkspaceRepository,
                private _layoutManager: LayoutManagerService,
                private _dialog: MatDialog,
                private _brokerService: BrokerService) {
        this._tradingProfileService.updateTradingProfile();
        
        this._workspacesSubscription = this._workspaceRepository.loadWorkspaces()
        .subscribe({
            next: (workspaces: Workspace[]) => {
                this._workspaces = workspaces;
            },
            error: (e) => {
                console.error(e);
            }
        });
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
    }

    private _resetLayout() {
        for (const w of this._workspaces) {
            if (w.id === "empty") {
                this._layoutManager.loadState(w.layoutState, true);
                break;
            }
        }
    }
}
