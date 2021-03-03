import { I } from '@angular/cdk/keycodes';
import {Component, Inject, Injector, Input, OnInit, ViewChild} from '@angular/core';
import { IdentityService } from '@app/services/auth/identity.service';

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
    private _showPublicUsername = false;
    
    items: Item[] = [];
    userId: string;

    public get showPublicUsername(): boolean {
        return this._showPublicUsername;
    }

    public set showPublicUsername(value: boolean) {
        this._showPublicUsername = value;
    }

    constructor(private identity: IdentityService) {
        for (let i = 1; i <= 50; i++) {
            this.items.push({
                position: i,
                level: i % 10,
                name: "some username",
                rank: "Bronze",
                userId: "asdasd"
            });
        }
        this.userId = identity.id;
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
    }

    isMyRow(item: Item): boolean {
        return item.userId === this.userId;
    }
}
