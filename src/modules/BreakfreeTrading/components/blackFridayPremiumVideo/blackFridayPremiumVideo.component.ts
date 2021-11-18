import { Component, Injector, Inject, ElementRef, ViewChild, OnInit } from '@angular/core';
import {BaseGoldenLayoutItemComponent} from "@layout/base-golden-layout-item.component";
import {GoldenLayoutItemState} from "angular-golden-layout";
import { TranslateService } from '@ngx-translate/core';
import { BreakfreeTradingTranslateService } from 'modules/BreakfreeTrading/localization/token';
import { MatDialog } from '@angular/material/dialog';
import { CheckoutComponent } from '../checkout/checkout.component';
import { IdentityService } from '@app/services/auth/identity.service';
import { Modal } from 'modules/Shared/helpers/modal';
import { AppRoutes } from '@app/app.routes';

@Component({
    selector: 'BlackFridayPremiumVideo',
    templateUrl: './blackFridayPremiumVideo.component.html',
    styleUrls: ['./blackFridayPremiumVideo.component.scss']
})
export class BlackFridayPremiumVideoComponent extends Modal<CheckoutComponent> implements OnInit {

    constructor(protected _injector: Injector, protected _identityService: IdentityService) {
        super(_injector);
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
    }

    openMentalAlchemy() {
        window.open(`${location.origin}/#/${AppRoutes.Platform}/${AppRoutes.Academy}/qa3z1iua7r`, '_blank').focus();
        
    }

    openBlueprint() {
        window.open(`${location.origin}/#/${AppRoutes.Platform}/${AppRoutes.Academy}/3jc17um90b`, '_blank').focus();
    }
}

