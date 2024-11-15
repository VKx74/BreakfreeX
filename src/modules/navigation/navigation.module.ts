import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from "./components/navigation/navigation.component";
import { LocalizationModule } from "Localization";
import { MatMenuModule } from "@angular/material/menu";
import { SharedModule } from "Shared";
import { RouterModule } from "@angular/router";
import { UIModule } from "UI";
import { ExchangeStatusConfiguratorComponent } from "./components/exchange-status-configurator/exchange-status-configurator.component";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from "@angular/material/button";
import { UserInfoMenuComponent } from './components/user-info-menu/user-info-menu.component';
import { MatDividerModule } from "@angular/material/divider";
import { MatRadioModule } from "@angular/material/radio";
import { ReactiveFormsModule } from "@angular/forms";
import { SidebarToggleComponent } from './components/sidebar-toggle/sidebar-toggle.component';
import { BaseNavComponent } from './components/base-nav/base-nav.component';
import { NavDelimiterComponent } from './components/nav-delimiter/nav-delimiter.component';
import { NavSectionComponent } from './components/nav-section/nav-section.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LayoutManagementMenuComponent } from './components/layout-management-menu/layout-management-menu.component';
import { SocialNotificationsComponent } from './components/notifications/social-notifications.component';
import { LoaderModule } from 'modules/loader/loader.module';
import { SportCountService } from './services/sport.count.service';

@NgModule({
    declarations: [
        ExchangeStatusConfiguratorComponent,
        NavigationComponent,
        UserInfoMenuComponent,
        SidebarToggleComponent,
        BaseNavComponent,
        NavDelimiterComponent,
        NavSectionComponent,
        LayoutManagementMenuComponent,
        SocialNotificationsComponent
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
        MatProgressBarModule,
        LoaderModule
    ],
    providers: [
        SportCountService
    ],
    entryComponents: [
        ExchangeStatusConfiguratorComponent
    ],
    exports: [
        NavigationComponent,
        BaseNavComponent,
        NavSectionComponent,
        SocialNotificationsComponent
        // WorkspacesComponent,
    ],

})
export class NavigationModule {
}
