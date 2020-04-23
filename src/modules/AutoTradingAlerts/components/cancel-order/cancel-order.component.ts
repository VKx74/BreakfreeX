import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { AutoTradingAlertsTranslateService } from "../../localization/token";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";


@Component({
    selector: 'app-cancel-order',
    templateUrl: './cancel-order.component.html',
    styleUrls: ['./cancel-order.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: AutoTradingAlertsTranslateService
        }
    ]
})
export class CancelOrderComponent implements OnInit {
    CancelOrderForm: FormGroup;
    private _orderId: string = '';

    constructor(private _dialog: MatDialog,
        private _fb: FormBuilder,
        public dialogRef: MatDialogRef<CancelOrderComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {       
        if (data && data.trade && data.trade.OrderId)
            this._orderId = data.trade.OrderId;
    }

    ngOnInit() {
        this._initCancelOrderForm();
    }

    _initCancelOrderForm() {
        this.CancelOrderForm = this._fb.group(
            {
                idInput: new FormControl(this._orderId),
            }
        );
    }

    sendId() {
        this.dialogRef.close(this.CancelOrderForm.controls['idInput'].value);
    }

}
