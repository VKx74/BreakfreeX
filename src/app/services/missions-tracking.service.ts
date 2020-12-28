import { Injectable } from "@angular/core";
import { IdentityService } from "@app/services/auth/identity.service";
import { NotificationsService } from "@alert/services/notifications.service";
import { IBFTMission, TradingProfileService } from "modules/BreakfreeTrading/services/tradingProfile.service";
import { Subject, Subscription } from "rxjs";
import { BrokerService } from "./broker.service";
import { MTBroker } from "./mt/mt.broker";
import { OrderTypes } from "modules/Trading/models/models";
import { MTCurrencyRiskType } from "modules/Trading/models/forex/mt/mt.models";

@Injectable()
export class MissionTrackingService {
    private _brokerStateChangedSubscription: Subscription;
    private _ordersUpdatedSubscription: Subscription;
    private _onOrdersParametersUpdated: Subscription;
    private _timeInterval: number = 1000 * 60 * 13; // 13 min
    private _timeout: number = 1000 * 60 * 1.5; // 1.5 min
    private _recalculateRequired: boolean = true;

    constructor(private _identity: IdentityService,
        private _notificationService: NotificationsService,
        private _brokerService: BrokerService,
        private _tradingProfileService: TradingProfileService) {
        
        this._tradingProfileService.MissionChanged.subscribe(() => {
            this._processMissions();
        });
        this._brokerStateChangedSubscription = this._brokerService.activeBroker$.subscribe((data) => {
            if (this._brokerService.activeBroker instanceof MTBroker) {
                this._ordersUpdatedSubscription = this._brokerService.activeBroker.onOrdersUpdated.subscribe(() => {
                    this._recalculate();
                }); 
                
                this._onOrdersParametersUpdated = this._brokerService.activeBroker.onOrdersParametersUpdated.subscribe(() => {
                    this._recalculate();
                });
            } else {
                this._recalculateRequired = true;
                if (this._ordersUpdatedSubscription) {
                    this._ordersUpdatedSubscription.unsubscribe();
                    this._ordersUpdatedSubscription = null;
                } 
                if (this._onOrdersParametersUpdated) {
                    this._onOrdersParametersUpdated.unsubscribe();
                    this._onOrdersParametersUpdated = null;
                }
            }
        });
    }

    public _recalculate() {
        if (!this._recalculateRequired) {
            return;
        }
        let activeBroker = this._brokerService.activeBroker as MTBroker;
        if (activeBroker && activeBroker.canCalculateVARByOrdersType(OrderTypes.Market)) {
            this._recalculateRequired = false;
            this._updateMissions();
        }
    }

    public initMissions() {
        this._tradingProfileService.initMissions();

        setTimeout(() => {
            if (!this._recalculateRequired) {
                return;
            }
            this._updateMissions();
        }, this._timeout);
    }

    public watchMissions() {
        setInterval(() => {
            try {
                this._updateMissions();
            } catch (error) {}
        }, this._timeInterval);
    }

    private _updateMissions() {
        if (!this._identity.isAuthorizedCustomer) {
            return;
        }   
        
        let varRisk = null;
        let currencyVarRisk = null;
        let activeBroker = this._brokerService.activeBroker as MTBroker;
        if (this._brokerService.isConnected && activeBroker) {
            varRisk = activeBroker.calculateTotalVarRiskByOrdersType(OrderTypes.Market);
            const risks = activeBroker.currencyVARRisks;
            for (const risk of risks) {
                if(risk.Type !== MTCurrencyRiskType.Actual) {
                    continue;
                }
                
                if (!currencyVarRisk || currencyVarRisk < risk.Risk) {
                    currencyVarRisk = risk.Risk;
                }
            }
        }

        this._tradingProfileService.updateMissions(varRisk, currencyVarRisk);
    }

    private _processMissions() {
        if (!this._tradingProfileService.missions) {
            return;
        }

        let count = 1;
        if (this._tradingProfileService.missions.daily) {
            for (const mission of this._tradingProfileService.missions.daily) {
                if (mission.wasJustReached) {
                    this._showMissionEarned(mission, "Daily Experience Earned");
                }

                if (++count > 3) {
                    break;
                }
            }
        }

        count = 1;
        if (this._tradingProfileService.missions.weekly) {
            for (const mission of this._tradingProfileService.missions.weekly) {
                if (mission.wasJustReached) {
                    this._showMissionEarned(mission, "Weekly Experience Earned");
                }

                if (++count > 3) {
                    break;
                }
            }
        }

        this._tradingProfileService.setProcessedState();
    }

    private _showMissionEarned(mission: IBFTMission, header: string) {
        this._notificationService.show(`<div class="complete-mission-notification-row"><i class="fa fa-check" aria-hidden="true"></i>${mission.name}</div>`, header);
        // this._notificationService.show(`<div class="complete-mission-notification-row"><i class="fa fa-check" aria-hidden="true"></i>${mission.name}</div>`, "Experience Earned");
    }

}
