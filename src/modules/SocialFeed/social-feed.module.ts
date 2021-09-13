import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {UIModule} from "UI";
import {SharedModule} from "Shared";
import { MatMenuModule } from "@angular/material/menu";
import { LoaderModule } from "modules/loader/loader.module";
import { MatSidenavModule } from "@angular/material/sidenav";
import { SocialFeedRoutingModule } from "./social-feed.router";
import { SocialFeedRootComponent } from "./components/root/social-feed.component";
import { SocialFeedComponent } from "./components/social-feed-component/social-feed.component";
import { BreakfreeTradingSocialModule } from "modules/BreakfreeTradingSocial";
import { SocialItemComponent } from "./components/social-item-component/social-item.component";

@NgModule({
    declarations: [
        SocialFeedRootComponent,
        SocialFeedComponent,
        SocialItemComponent
    ],
    imports: [
        CommonModule,
        UIModule,
        SharedModule,
        MatMenuModule,
        SocialFeedRoutingModule,
        LoaderModule,
        MatSidenavModule,
        BreakfreeTradingSocialModule
    ],
    providers: [
    ],
    entryComponents: [],
    exports: [
        SocialFeedComponent
    ]
})
export class SocialFeedModule {
}
