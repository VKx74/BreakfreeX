import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TradingDialogRoutingModule } from './trading-dialog-routing.module';
import {WithdrawModalComponent} from "./components/withdraw-modal/withdraw-modal.component";
import {ModalDepositComponent} from "./components/modal-deposit/modal-deposit.component";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatInputModule} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UIModule} from "UI";
import {TranslateModule} from "@ngx-translate/core";
import {MatError, MatFormFieldModule} from "@angular/material/form-field";
import {FormErrorDirectiveModule} from "@form-error-directive/form-error-directive.module";
import {CalendarEventsModule} from "@calendarEvents/calendar-events.module";
import { BackgroundIconComponent } from './components/background-icon/background-icon.component';

@NgModule({
  declarations: [
      WithdrawModalComponent,
      ModalDepositComponent,
      BackgroundIconComponent,
  ],
    imports: [
        CommonModule,
        TradingDialogRoutingModule,
        MatCheckboxModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        UIModule,
        TranslateModule,
        MatFormFieldModule,
        FormErrorDirectiveModule,
        CalendarEventsModule
    ],
  entryComponents: [
    WithdrawModalComponent,
    ModalDepositComponent
  ]
})
export class TradingDialogModule { }
