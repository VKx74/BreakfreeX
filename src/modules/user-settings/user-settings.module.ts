import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RootComponent} from "./components/root/root.component";
import {UserSettingsRouterModule} from "./user-settings.router";
import {MatTabsModule} from "@angular/material/tabs";
import {ChatModule} from "../Chat/chat.module";
import {UIModule} from "UI";
import {MatSelectModule} from "@angular/material/select";
import {LocalizationModule} from "Localization";
import {AuthSettingsComponent} from "./components/auth-settings/auth-settings.component";
import {SharedModule} from "Shared";
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {ChangePasswordComponent} from "./components/change-password/change-password.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatMenuModule} from "@angular/material/menu";
import { TradesComponent } from './components/trades/trades.component';
import {DatatableModule} from "../datatable/datatable.module";
import { TableWrapperComponent } from './components/table-wrapper/table-wrapper.component';
import {ProfileUserComponent} from "./components/profile-user/profile-user.component";
import {DepositsComponent} from "./components/deposits-user/deposits.component";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {WithdrawsComponent} from "./components/withdraws-user/withdraws.component";
import {MatDialogModule} from "@angular/material/dialog";
import {TradingDialogModule} from "../trading-dialog/trading-dialog.module";
import {WrapperModule} from "../ViewModules/wrapper/wrapper.module";
import {TradesResolver} from "./resolvers/trades.resolver";
import {ChangePhoneComponent} from "./components/change-phone/change-phone.component";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {IdentityLogsService} from "@app/services/identity-logs.service";
import {LoaderModule} from "../loader/loader.module";
import { ProfileActivitiesLoginComponent } from './components/profile-activities-login/profile-activities-login.component';
import {ProfileActivitiesModule} from "./profile-activities.module";
import {ProfileActivitiesResolver} from "./resolvers/profile-activities.resolver";
import {ProfileLoginActivitiesResolver} from "./resolvers/login-activities.resolver";
import {ChangeUsernameComponent} from "./components/change-username/change-username.component";
import { UserSubscriptionsComponent } from './components/user-subscriptions/user-subscriptions.component';

@NgModule({
    declarations: [
        RootComponent,
        ProfileUserComponent,
        AuthSettingsComponent,
        ChangePasswordComponent,
        TradesComponent,
        TableWrapperComponent,
        DepositsComponent,
        WithdrawsComponent,
        TradesComponent,
        TableWrapperComponent,
        ChangePhoneComponent,
        ChangeUsernameComponent
    ],
    imports: [
        CommonModule,
        UserSettingsRouterModule,
        MatTabsModule,
        ChatModule,
        UIModule,
        MatSelectModule,
        LocalizationModule,
        SharedModule,
        EducationalTipsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatMenuModule,
        MatDatepickerModule,
        DatatableModule,
        FormsModule,
        MatDialogModule,
        TradingDialogModule,
        MatDialogModule,
        WrapperModule,
        MatSlideToggleModule,
        LoaderModule,
        ProfileActivitiesModule.forPlatform(),
    ],
    entryComponents: [],
    providers: [
        TradesResolver,
        ProfileActivitiesResolver,
        ProfileLoginActivitiesResolver,
        IdentityLogsService
    ]
})
export class UserSettingsModule {
}
