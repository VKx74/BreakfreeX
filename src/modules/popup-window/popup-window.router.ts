import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PopupWindowRootComponent} from "./components/popup-window-root/popup-window-root.component";
import {ComponentsGuard} from "@app/guards/components.guard";
import {UserSettingsResolver} from "@app/services/user-settings.resolver";
import {DashboardResolver} from "@app/resolvers/dashboard.resolver";

const routes: Routes = [
    {
        path: '',
        component: PopupWindowRootComponent,
        resolve: {
            userSettings: UserSettingsResolver,
        }
    },
    {
        path: '**',
        redirectTo: ''
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PopupWindowRoutingModule {
}
