import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavigationComponent} from "./components/navigation/navigation.component";
import {LocalizationModule} from "Localization";
import {MatMenuModule} from "@angular/material/menu";
import {SharedModule} from "Shared";
import {RouterModule} from "@angular/router";
import {UIModule} from "UI";
import {ExchangeStatusConfiguratorComponent} from "./components/exchange-status-configurator/exchange-status-configurator.component";
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from "@angular/material/button";
import {UserInfoMenuComponent} from './components/user-info-menu/user-info-menu.component';
import {MatDividerModule} from "@angular/material/divider";
import {WalletsListComponent} from './components/wallets-list/wallets-list.component';
import {MatRadioModule} from "@angular/material/radio";
import {ReactiveFormsModule} from "@angular/forms";
import {TradingDialogModule} from "../trading-dialog/trading-dialog.module";
import { SidebarToggleComponent } from './components/sidebar-toggle/sidebar-toggle.component';
import { BaseNavComponent } from './components/base-nav/base-nav.component';
import { NavDelimiterComponent } from './components/nav-delimiter/nav-delimiter.component';
import { NavSectionComponent } from './components/nav-section/nav-section.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BadgeComponent } from './components/badge/badge.component';

@NgModule({
    declarations: [
        ExchangeStatusConfiguratorComponent,
        NavigationComponent,
        UserInfoMenuComponent,
        WalletsListComponent,
        SidebarToggleComponent,
        BaseNavComponent,
        NavDelimiterComponent,
        NavSectionComponent,
        BadgeComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        LocalizationModule,
        SharedModule,
        MatMenuModule,
        UIModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
        MatRadioModule,
        ReactiveFormsModule,
        TradingDialogModule,
        MatProgressBarModule
    ],
    entryComponents: [
        ExchangeStatusConfiguratorComponent
    ],
    exports: [
        NavigationComponent,
        BaseNavComponent,
        NavSectionComponent,
        // WorkspacesComponent,
    ],
})
export class NavigationModule {
}
