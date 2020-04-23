import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {RunningScriptsComponent} from "@scripting/components/running-scripts/running-scripts.component";
import {HistoryDataManagerComponent} from "@historyStorage/components/history-data-manager/history-data-manager.component";
import {ScriptEditorComponent} from "@scripting/components/script-editor/script-editor.component";
import {UserSettingsResolver} from "@app/services/user-settings.resolver";
import {ScriptingPageComponent} from "./components/scripting-page/scripting-page.component";
import {ScriptingPageRoutes} from "./scripting-page.routes";
import {RunBacktestComponent} from "../backtest/components/run-backtest/run-backtest.component";

const routes: Routes = [
    {
        path: '',
        component: ScriptingPageComponent,
        resolve: {
            userSettings: UserSettingsResolver,
        },
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: ScriptingPageRoutes.ScriptingManager
            },
            {
                path: ScriptingPageRoutes.ScriptingManager,
                component: ScriptEditorComponent
            },
            {
                path: ScriptingPageRoutes.RunningScripts,
                component: RunningScriptsComponent
            },
            {
                path: ScriptingPageRoutes.Backtest,
                component: RunBacktestComponent
            },
        ]
    },
    {
        path: '**',
        redirectTo: ''
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ScriptingPageRoutingModule {
}
