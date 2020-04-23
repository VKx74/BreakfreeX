import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ScriptingPageRoutingModule} from './scripting-page-routing.module';
import {ScriptingPageComponent} from './components/scripting-page/scripting-page.component';
import {ScriptingModule} from "@scripting/scripting.module";
import {BacktestModule} from "../backtest/backtest.module";
import {HistoryStorageModule} from "@historyStorage/historyStorage.module";
import {MatTabsModule} from "@angular/material/tabs";
import {WrapperModule} from "../ViewModules/wrapper/wrapper.module";

@NgModule({
    declarations: [ScriptingPageComponent],
    imports: [
        CommonModule,
        ScriptingPageRoutingModule,
        MatTabsModule,

        ScriptingModule,
        BacktestModule,
        HistoryStorageModule,
        WrapperModule
    ]
})
export class ScriptingPageModule {
}
