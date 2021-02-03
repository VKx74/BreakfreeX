import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ComponentIdentifier} from "@app/models/app-config";
import { IRegistrationStats } from '@app/models/common/registrationStats';
import { UsersService } from '@app/services/users.service';
import { ChartWrapperSettings } from 'modules/BreakfreeTrading/components/tradingPerformance/model/ChartWrapperSettings';

@Component({
    selector: 'registrations-dashboard',
    templateUrl: './registrations-dashboard.component.html',
    styleUrls: ['./registrations-dashboard.component.scss']
})
export class RegistrationsDashboardComponent implements OnInit {
    public chartSett: ChartWrapperSettings = new ChartWrapperSettings(0, 'Registrations last 30-Days', 'bar', 'Users');
    public chartDataSet: {[key: number]: number} = {};

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    constructor(private _userService: UsersService,
                private _activatedRoute: ActivatedRoute) {
    }

    ngOnInit() {
        this._userService.getRegistrationsStats().subscribe((data: IRegistrationStats[]) => {
            this.chartDataSet = {};
            for (const i of data) {
                this.chartDataSet[i.date] = i.count;
            }
        });
    }
}