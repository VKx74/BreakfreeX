import {AfterViewInit, Component, OnInit} from '@angular/core';
import {BrokerService} from "@app/services/broker.service";
import {TranslateService} from "@ngx-translate/core";
import {IdentityService} from "@app/services/auth/identity.service";
import {takeUntil} from "rxjs/operators";
import {AlertService} from "@alert/services/alert.service";
import {SignalService} from "@app/services/signal.service";
import {AudioService} from "@app/services/audio.service";
import {BrokerStorage} from "@app/services/broker.storage";
import {Actions, ofType} from "@ngrx/effects";
import {ActionTypes} from "@platform/store/actions/platform.actions";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {UserSettingsService} from "@app/services/user-settings/user-settings.service";
import {ActivatedRoute} from "@angular/router";
import {PlatformTranslateService} from "@platform/localization/token";
import { NotificationsService, NotificationType } from '@alert/services/notifications.service';
import { EBrokerNotification } from '@app/interfaces/broker/broker';
import { SocialRealtimeNotificationsService } from 'modules/BreakfreeTradingSocial/services/realtime.notifications.service';

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
    private _playSoundLoop: any;


    constructor(private _actions: Actions,
                private _identityService: IdentityService,
                private _brokerStorage: BrokerStorage,
                private _signalService: SignalService,
                private _audioService: AudioService,
                private _userSettingsService: UserSettingsService,
                private _brokerService: BrokerService,
                private _socialRealtimeNotificationsService: SocialRealtimeNotificationsService,
                private _route: ActivatedRoute,
                private _alertService: AlertService,
                private _notificationsService: NotificationsService) {
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

        this._brokerService.onNotification.subscribe(value => {
            if (value.type === EBrokerNotification.OrderSLHit) {
                this._notificationsService.show(`${value.order.Symbol} order #${value.order.Id} - SL Hit`, "Stop Loss Hit", NotificationType.Info);
            } else if (value.type === EBrokerNotification.OrderTPHit) {
                this._notificationsService.show(`${value.order.Symbol} order #${value.order.Id} - TP Hit`, "Take Profit Hit", NotificationType.Info);
            } else if (value.type === EBrokerNotification.OrderFilled) {
                this._notificationsService.show(`${value.order.Symbol} order #${value.order.Id} - Filled`, "Order Filled", NotificationType.Info);
            }
        });
    }

    ngAfterViewInit() {
        this._signalService.onPopupSignal.subscribe(value => {
            this._alertService.info(value.message, value.title, 60 * 30, () => {
                if (this._playSoundLoop) {
                    clearInterval(this._playSoundLoop);
                    this._playSoundLoop = null; 
                }
            });
        });

        this._signalService.onSoundSignal.subscribe(value => {
            let soundId = value.soundId;

            if (this._playSoundLoop) {
                clearInterval(this._playSoundLoop);
            }

            this._audioService.playSound(soundId);
                
            this._playSoundLoop = setInterval(() => {
                this._audioService.playSound(soundId);
            }, 1000 * 5);
        });
    }


    ngOnDestroy() {
    }
}
