import {AfterViewInit, Component, OnInit} from '@angular/core';
import {BrokerService, IBrokerServiceState} from "@app/services/broker.service";
import {TranslateService} from "@ngx-translate/core";
import {DataStorage} from "../../../Storage/services/data-storage";
import {LayoutStorage} from "@app/services/layout.storage";
import {IdentityService} from "@app/services/auth/identity.service";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {EBrokerInstance, IBroker} from "@app/interfaces/broker/broker";
import {AlertService} from "@alert/services/alert.service";
import {SignalService} from "@app/services/signal.service";
import {AudioService} from "@app/services/audio.service";
import {BrokerStorage} from "@app/services/broker.storage";
import {Actions, ofType} from "@ngrx/effects";
import {ActionTypes} from "@platform/store/actions/platform.actions";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {UserSettingsService} from "@app/services/user-settings/user-settings.service";
import {ActivatedRoute, NavigationEnd, NavigationError, NavigationStart, Router} from "@angular/router";
import {InstrumentService} from '@app/services/instrument.service';
import {RealtimeService} from '@app/services/realtime.service';
import {HistoryService} from '@app/services/history.service';
import {PlatformTranslateService} from "@platform/localization/token";
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";
import {SidebarService} from "@app/services/sidebar.service";
import {of} from "rxjs";
import {BitmexBrokerService} from "@app/services/bitmex.exchange/bitmex.broker.service";

@Component({
    selector: 'platform',
    templateUrl: './platform.component.html',
    styleUrls: ['./platform.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: PlatformTranslateService
        }
    ]
})
export class PlatformComponent implements OnInit, AfterViewInit {
    private _saveBroker: boolean = true;


    constructor(private _actions: Actions,
                private _dataStorage: DataStorage,
                private _identityService: IdentityService,
                private _layoutStorage: LayoutStorage,
                private _brokerStorage: BrokerStorage,
                private _signalService: SignalService,
                private _audioService: AudioService,
                private _instrumentService: InstrumentService,
                private _realtimeService: RealtimeService,
                private _historyService: HistoryService,
                private _userSettingsService: UserSettingsService,
                private _brokerService: BrokerService,
                private _route: ActivatedRoute,
                private _router: Router,
                private _translateService: TranslateService,
                private _sidebarService: SidebarService,
                private _alertService: AlertService) {
    }

    ngOnInit() {
        this._userSettingsService.applySettings(
            this._route.snapshot.data['userSettings']
        );

        this._actions
            .pipe(
                ofType(ActionTypes.DeleteSession, ActionTypes.AppTypeChanged),
                takeUntil(componentDestroyed(this))
            )
            .subscribe(() => {
                this._saveBroker = false;
                this._brokerStorage.clear();

                window.location.reload();
            });

        this._brokerService.onSaveStateRequired.subscribe(value => {
            if (this._identityService.isAuthorized && this._saveBroker) {
                this._brokerService.saveState().subscribe(newState => {
                    this._brokerStorage.saveBrokerState(newState);
                });
            }
        });

    }

    ngAfterViewInit() {
        this._signalService.onPopupSignal.subscribe(value => {
            this._alertService.info(value.message, value.title);
        });

        this._signalService.onSoundSignal.subscribe(value => {
            this._audioService.playSound(value.soundId);
        });
    }


    ngOnDestroy() {
    }
}
