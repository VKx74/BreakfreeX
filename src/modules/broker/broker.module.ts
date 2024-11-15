import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IDEModule} from "../ide/ide.module";
import {TradingModule} from "Trading";
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {SettingsTranslateService} from "./localization/token";
import {UIModule} from "UI";
import {LoadingModule} from "ngx-loading";
import {SharedModule} from "Shared";
import {MatInputModule} from "@angular/material/input";
import {MatTabsModule} from "@angular/material/tabs";
import {FormErrorDirectiveModule} from "@form-error-directive/form-error-directive.module";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {PersonalInfoService} from "@app/services/personal-info/personal-info.service";
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {FileUploaderModule} from "../file-uploader/file-uploader.module";
import {SharedTranslateService} from "@app/localization/shared.token";
import {MatMenuModule} from "@angular/material/menu";
import { BrokerDialogComponent } from './components/broker/broker-dialog/broker-dialog.component';
import {LoaderModule} from "../loader/loader.module";
import { PrivacyPolicyTradingModalComponent } from 'modules/Shared/components/privacy-policy-trading/privacy-policy-trading.component';
import { MTConnectedAccountInfoComponent } from './components/broker/forex/mt/mt-connected-account-info/mt-connected-account-info.component';
import { DatatableModule } from 'modules/datatable/datatable.module';
import { MatTableModule } from '@angular/material/table';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MTBrokerLoginComponent } from './components/broker/forex/mt/mt.broker.login.component';
import { BinanceBrokerLoginComponent } from './components/broker/crypto/binance/binance.broker.login.component';
import { BinanceConnectedAccountInfoComponent } from './components/broker/crypto/binance/connected-account-info/binance-connected-account-info.component';
import { LiabilityPolicyTradingModalComponent } from 'modules/Shared/components/liability-policy-trading/liability-policy-trading.component';
import { ProfitPolicyTradingModalComponent } from 'modules/Shared/components/profit-policy-trading/profit-policy-trading.component';


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        IDEModule,
        TradingModule,
        LocalizationModule,
        LoadingModule,
        UIModule,
        FormsModule,
        SharedModule,
        FormErrorDirectiveModule,
        FileUploaderModule,
        EducationalTipsModule,

        MatSlideToggleModule,
        MatInputModule,
        MatTabsModule,
        MatMenuModule,
        LoaderModule,
        DatatableModule,
        MatTableModule,

        MatFormFieldModule,
        MatAutocompleteModule
    ],
    declarations: [
        // AlertWidgetComponent,
        // ProfileActivitiesComponent,
        // ForexBrokerComponent,
        MTBrokerLoginComponent,
        BrokerDialogComponent,
        MTConnectedAccountInfoComponent,
        BinanceBrokerLoginComponent,
        BinanceConnectedAccountInfoComponent
    ],
    entryComponents: [
        BrokerDialogComponent,
        PrivacyPolicyTradingModalComponent,
        ProfitPolicyTradingModalComponent,
        LiabilityPolicyTradingModalComponent
    ],
    exports: [
        BrokerDialogComponent,
    ],
    providers: [
        PersonalInfoService,
        {
            provide: SettingsTranslateService,
            useFactory: TranslateServiceFactory('settings'),
            deps: [Injector, SharedTranslateService]
        }
    ]
})
export class BrokerModule {

}
