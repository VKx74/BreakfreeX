import {ChangeDetectionStrategy, Component, Inject, Input, OnInit} from '@angular/core';
import { UserModel } from '@app/models/auth/auth.models';

@Component({
    selector: 'user-subscriptions',
    templateUrl: './user-subscriptions.component.html',
    styleUrls: ['./user-subscriptions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSubscriptionsComponent implements OnInit {
    @Input() user: UserModel;

    constructor() {
    }

    ngOnInit() {
    }
}