import { Component, Injector, Inject, ElementRef, ViewChild } from '@angular/core';
import {BaseGoldenLayoutItemComponent} from "@layout/base-golden-layout-item.component";
import {GoldenLayoutItemState} from "angular-golden-layout";
import { TranslateService } from '@ngx-translate/core';
import { BreakfreeTradingTranslateService } from 'modules/BreakfreeTrading/localization/token';
import { MatDialog } from '@angular/material/dialog';
import { CheckoutComponent } from '../checkout/checkout.component';
import { IdentityService } from '@app/services/auth/identity.service';

export interface IBFTAcademyComponentState {
}

@Component({
    selector: 'BreakfreeTradingAcademy',
    templateUrl: './breakfreeTradingAcademy.component.html',
    styleUrls: ['./breakfreeTradingAcademy.component.scss']
})
export class BreakfreeTradingAcademyComponent extends BaseGoldenLayoutItemComponent {

    static componentName = 'BreakfreeTradingAcademy';

    static previewImgClass = 'crypto-icon-information';

    protected useLinker(): boolean {
        return false;
    }

    public get isAuthorizedCustomer(): boolean {
        return this._identityService.isAuthorizedCustomer;
    } 

    constructor(@Inject(GoldenLayoutItemState) protected _state: IBFTAcademyComponentState, 
        @Inject(BreakfreeTradingTranslateService) private _bftTranslateService: TranslateService,
        protected _injector: Injector, private _dialog: MatDialog, private _identityService: IdentityService) {
        super(_injector);

        if (_state) {
            this._loadState(_state);
        }
    }

    ngOnInit() {
        super.setTitle(
            this._bftTranslateService.stream('breakfreeTradingAcademyComponentName')
        );
    }

    getComponentState(): IBFTAcademyComponentState {
        // save your state
        return {
        };
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    private _loadState(state: IBFTAcademyComponentState) {
        if (state) {
            // restore your state
        }
    }

    processCheckout() {
        this._dialog.open(CheckoutComponent, { backdropClass: 'backdrop-background' });
    }
}

