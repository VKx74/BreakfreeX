import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LanguageSelectComponent} from "./components/language-select/language-select.component";
import {SidebarComponent} from "./components/sidebar/sidebar.component";
import {UIModule} from "UI";
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatMenuModule} from "@angular/material/menu";
import {RouterModule} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import { BuyAppComponent } from './components/buy-app/buy-app.component';
import { SidebarSectionComponent } from './components/sidebar-section/sidebar-section.component';
import { ThemeLanguageSelectComponent } from './components/theme-language-select/theme-language-select.component';
import { SidebarContainerComponent } from './components/sidebar-container/sidebar-container.component';
import {SharedModule} from "Shared";
import { BaseSidebarComponent } from './components/base-sidebar/base-sidebar.component';
import {MatSidenavModule} from "@angular/material/sidenav";
import {LoaderModule} from "../loader/loader.module";
import { FormsModule } from '@angular/forms';

const COMPONENTS = [
    LanguageSelectComponent,
    SidebarContainerComponent,
    ThemeLanguageSelectComponent,
    SidebarSectionComponent,
    BuyAppComponent,
    BaseSidebarComponent,
];

@NgModule({
    declarations: [
        ...COMPONENTS,
        SidebarComponent
    ],
    exports: [
        ...COMPONENTS
    ],
    imports: [
        CommonModule,
        MatSlideToggleModule,
        UIModule,
        MatMenuModule,
        RouterModule,
        TranslateModule,
        SharedModule,
        MatSidenavModule,
        LoaderModule,
        FormsModule
    ]
})
export class SidebarModule {
}
