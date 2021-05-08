import { Injectable } from "@angular/core";
import { IdentityService } from "@app/services/auth/identity.service";
import { NotificationsService, NotificationType } from "@alert/services/notifications.service";
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
    private _nextUpdateTime: number; // 13 min
    private _timeInterval: number = 1000 * 60 * 13; // 13 min
    private _timeout: number = 1000 * 60 * 1.5; // 1.5 min
    private _recalculateRequired: boolean = true;
    private _failedMissionsTimeout: any;

    public get nextUpdateTime(): number {
        return this._nextUpdateTime;
    }

    public get broker(): MTBroker {
        if (this._brokerService.activeBroker instanceof MTBroker) {
            return this._brokerService.activeBroker as MTBroker;
        }

        return null;
    }

    constructor(private _identity: IdentityService,
        private _notificationService: NotificationsService,
        private _brokerService: BrokerService,
        private _tradingProfileService: TradingProfileService) {
        
        this._tradingProfileService.MissionChanged.subscribe(() => {
            this._processMissions();
        });
        this._brokerStateChangedSubscription = this._brokerService.activeBroker$.subscribe((data) => {
            if (this.broker) {
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
        if (!this.broker) {
            return;
        }

        if (!this._recalculateRequired) {
            return;
        }
        
        let activeBroker = this.broker;
        if (activeBroker && activeBroker.canCalculateHighestVAR(OrderTypes.Market)) {
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

            this._nextUpdateTime = new Date().getTime() + this._timeInterval;

        }, this._timeInterval);

        this._nextUpdateTime = new Date().getTime() + this._timeInterval;
    }

    private _updateMissions() {
        if (!this._identity.isAuthorizedCustomer || !this.broker) {
            return;
        }   
        
        let varRisk = null;
        let currencyVarRisk = 0;
        if (this._brokerService.isConnected && this.broker) {
            varRisk = this.broker.calculateHighestVAR(OrderTypes.Market);
            const risks = this.broker.currencyRisks;
            for (const risk of risks) {
                if (risk.Type !== MTCurrencyRiskType.Actual) {
                    continue;
                }

                if (!currencyVarRisk || currencyVarRisk < risk.RiskPercentage) {
                    currencyVarRisk = risk.RiskPercentage;
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
                    if (++count > 3) {
                        break;
                    }
                }
            }
        }

        count = 1;
        if (this._tradingProfileService.missions.weekly) {
            for (const mission of this._tradingProfileService.missions.weekly) {
                if (mission.wasJustReached) {
                    this._showMissionEarned(mission, "Weekly Experience Earned");
                    if (++count > 3) {
                        break;
                    }
                }
            }
        }

        this._tradingProfileService.setProcessedStateForReachedMissions();

        if (this._failedMissionsTimeout) {
            clearTimeout(this._failedMissionsTimeout);
        }

        this._failedMissionsTimeout = setTimeout(() => {
            this._failedMissionsTimeout = null;
            this._processFailedMissions();
        }, 1000);

    }

    private _processFailedMissions() {
        let count = 1;
        if (this._tradingProfileService.missions.daily) {
            for (const mission of this._tradingProfileService.missions.daily) {
                if (mission.wasJustFailed) {
                    this._showMissionFailed(mission, "Daily Mission Failed");
                    if (++count > 3) {
                        break;
                    }
                }
            }
        }

        count = 1;
        if (this._tradingProfileService.missions.weekly) {
            for (const mission of this._tradingProfileService.missions.weekly) {
                if (mission.wasJustFailed) {
                    this._showMissionFailed(mission, "Weekly Mission Failed");
                    if (++count > 3) {
                        break;
                    }
                }
            }
        }

        this._tradingProfileService.setProcessedStateForFailedMissions();
    }

    private _showMissionEarned(mission: IBFTMission, header: string) {
        this._notificationService.show(`<div class="complete-mission-notification-row">${mission.name}</div>`, header, NotificationType.Success);
        // this._notificationService.show(`<div class="complete-mission-notification-row"><i class="fa fa-check" aria-hidden="true"></i>${mission.name}</div>`, "Experience Earned");
    }

    private _showMissionFailed(mission: IBFTMission, header: string) {
        this._notificationService.show(`<div class="failed-mission-notification-row">${mission.name}</div>`, header, NotificationType.Error);
    }

}
