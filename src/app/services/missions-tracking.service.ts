import { Injectable } from "@angular/core";
import { IdentityService } from "@app/services/auth/identity.service";
import { NotificationsService } from "@alert/services/notifications.service";
import { IBFTMission, TradingProfileService } from "modules/BreakfreeTrading/services/tradingProfile.service";

@Injectable()
export class MissionTrackingService {
    private _timeInterval: number = 1000 * 60 * 13; // 13 min
    private _interval: any;
    constructor(private _identity: IdentityService,
        private _notificationService: NotificationsService,
        private _tradingProfileService: TradingProfileService) {
    }

    public watchMissions() {
        try {
            this._updateMissions();
        } catch (error) {}

        if (this._interval) {
            return;
        }

        this._interval = setInterval(() => {
            try {
                this._updateMissions();
            } catch (error) {}
        }, this._timeInterval);
    }

    private _updateMissions() {
        if (!this._identity.isAuthorizedCustomer) {
            return;
        }

        this._tradingProfileService.updateMissions(() => {
            try {
                this._processMissions();
            } catch (error) {}
        });
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
