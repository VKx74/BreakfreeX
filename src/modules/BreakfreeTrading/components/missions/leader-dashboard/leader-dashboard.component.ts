import { AlertService } from '@alert/services/alert.service';
import { I } from '@angular/cdk/keycodes';
import { Component, Inject, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { UserProfileModel } from '@app/models/auth/auth.models';
import { IdentityService } from '@app/services/auth/identity.service';
import { UsersProfileService } from '@app/services/users-profile.service';
import { TradingPerformanceService } from 'modules/BreakfreeTrading/services/tradingPerformance.service';

interface Item {
    userId: string;
    rank: string;
    name: string;
    level: number;
    position: number;
}

@Component({
    selector: 'leader-dashboard-component',
    templateUrl: './leader-dashboard.component.html',
    styleUrls: ['./leader-dashboard.component.scss']
})
export class LeaderDashboardComponent {
    private _userProfileModel: UserProfileModel;
    private _showPublicUsername = false;

    items: Item[] = [];
    userId: string;
    loading: boolean = false;

    public get showPublicUsername(): boolean {
        return this._showPublicUsername;
    }

    public set showPublicUsername(value: boolean) {
        this._showPublicUsername = value;

        if (this._showPublicUsername) {
            this._alertService.info("Real username on leaderboard enabled. Please wait up to 1 hour before this change is effective.");
        } else {
            this._alertService.info("Real username on leaderboard disabled. Please wait up to 1 hour before this change is effective");
        }
    }

    constructor(private _identityService: IdentityService,
        private _profileService: UsersProfileService,
        private _tradingPerformanceService: TradingPerformanceService,
        private _alertService: AlertService) {
        this.userId = this._identityService.id;
        this.loading = true;
        this._tradingPerformanceService.getPublicQuestsLeaderBoard(true).subscribe((items) => {
            this.loading = false;
            if (!items) {
                return;
            }

            let index = 1;
            for (const item of items) {
                this.items.push({
                    level: item.level,
                    name: item.userName,
                    position: index++,
                    rank: item.levelName,
                    userId: item.userId
                });
            }
        });
    }

    ngOnInit() {
        this._profileService.getUserProfileById(this._identityService.id, true)
            .subscribe(
                data => {
                    this._userProfileModel = data;
                    if (data) {
                        this._showPublicUsername = !!(data.useUserName);
                    } else {
                        this._showPublicUsername = false;
                    }
                });
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
        if (this._userProfileModel && this._userProfileModel.useUserName !== this._showPublicUsername) {
            this._profileService.patchUsingOfRandomNames(this._identityService.id, this._showPublicUsername).subscribe(data => {});
        }
    }

    isMyRow(item: Item): boolean {
        return item.userId === this.userId;
    }
}
