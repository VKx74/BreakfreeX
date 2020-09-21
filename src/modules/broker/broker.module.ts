import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IDEModule} from "../ide/ide.module";
import {TradingModule} from "Trading";
import {BrokerComponent} from './components/broker/broker.component';
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {SettingsTranslateService} from "./localization/token";
import {UIModule} from "UI";
import {LoadingModule} from "ngx-loading";
import {SharedModule} from "Shared";
import {CryptoBrokerComponent} from "./components/broker/crypto/crypto.broker.component";
import {BitmexBrokerLoginComponent} from "./components/broker/crypto/bitmex/bitmex.broker.login.component";
import {MatInputModule} from "@angular/material/input";
import {MatTabsModule} from "@angular/material/tabs";
import {FormErrorDirectiveModule} from "@form-error-directive/form-error-directive.module";
import {ForexBrokerComponent} from "./components/broker/forex/forex.broker.component";
import {OandaBrokerLoginComponent} from "./components/broker/forex/oanda/oanda.broker.login.component";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {PersonalInfoService} from "@app/services/personal-info/personal-info.service";
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {FileUploaderModule} from "../file-uploader/file-uploader.module";
import {SharedTranslateService} from "@app/localization/shared.token";
import {MatMenuModule} from "@angular/material/menu";
import { BrokerDialogComponent } from './components/broker/broker-dialog/broker-dialog.component';
import {LoaderModule} from "../loader/loader.module";
import { MT5BrokerLoginComponent } from './components/broker/forex/mt/mt5.broker.login.component';
import { PrivacyPolicyTradingModalComponent } from 'modules/Shared/components/privacy-policy-trading/privacy-policy-trading.component';
import { ConnectedAccountInfoComponent } from './components/broker/forex/mt/connected-account-info/connected-account-info.component';
import { DatatableModule } from 'modules/datatable/datatable.module';
import { MatTableModule } from '@angular/material/table';


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
        MatTableModule
    ],
    declarations: [
        // AlertWidgetComponent,
        // ProfileActivitiesComponent,
        BrokerComponent,
        CryptoBrokerComponent,
        BitmexBrokerLoginComponent,
        ForexBrokerComponent,
        OandaBrokerLoginComponent,
        MT5BrokerLoginComponent,
        BrokerDialogComponent,
        ConnectedAccountInfoComponent
    ],
    entryComponents: [
        BrokerDialogComponent,
        PrivacyPolicyTradingModalComponent
    ],
    exports: [
        BrokerComponent,
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
