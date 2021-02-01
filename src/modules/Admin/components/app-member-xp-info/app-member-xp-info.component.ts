import {Component, Input, OnInit} from '@angular/core';
import {Roles, UserModel} from "@app/models/auth/auth.models";
import {
    AccountInfoModel, BusinessAccountDocumentModel,
    PersonalInfoStatus
} from "@app/services/personal-info/personal-info.service";
import {AccountType} from "../../../Auth/models/models";
import {PersonalInfoHelper} from "@app/services/personal-info/personal-info-helper.service";
import {TzUtils} from "TimeZones";
import {DocumentsUrls, IPersonalInfoData} from "../app-member-info/app-member-info.component";
import {Observable} from "rxjs";
import { TradingProfileService } from 'modules/BreakfreeTrading/services/tradingProfile.service';

export type ApproveHandler = () => Observable<any>;
export type RejectHandler = (message: string) => Observable<any>;

@Component({
    selector: 'app-member-xp-info',
    templateUrl: './app-member-xp-info.component.html',
    styleUrls: ['./app-member-xp-info.component.scss']
})
export class AppMemberXpInfoComponent implements OnInit {
    @Input() userId: string;

    constructor(private _tradingProfileService: TradingProfileService) {
        this._tradingProfileService.getTradingMissionsByUSerId(this.userId).subscribe((data) => {
            console.log(data);
        });
    }

    ngOnInit() {
    }
}
