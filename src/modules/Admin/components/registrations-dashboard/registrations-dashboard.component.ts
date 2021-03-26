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
    public selectedEventsFromDateFilter: Date;
    public selectedEventsToDateFilter: Date;
    public loading: boolean = false;

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    constructor(private _userService: UsersService,
                private _activatedRoute: ActivatedRoute) {
        const dateNow = new Date().getTime();
        const dayShift = 60 * 60 * 24 * 1000;
        this.selectedEventsFromDateFilter = new Date(dateNow - (dayShift * 30));
        this.selectedEventsToDateFilter = new Date(dateNow + dayShift);
    }

    ngOnInit() {
       this._loadData();
    }

    reload() {
        this._loadData();
    }

    private _loadData()
    {
        let start = Math.trunc(this.selectedEventsFromDateFilter.getTime() / 1000);
        let end = Math.trunc(this.selectedEventsToDateFilter.getTime() / 1000);
        
        this.loading = true;
        this._userService.getRegistrationsStatsByDate(start, end).subscribe((data: IRegistrationStats[]) => {
            this.loading = false;
            this.chartDataSet = {};
            for (const i of data) {
                this.chartDataSet[i.date] = i.count;
            }
        }, () => {
            this.loading = false;
        });
    }
}