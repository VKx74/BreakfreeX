import {RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import { SocialFeedRootComponent } from "./components/root/social-feed.component";
import { SocialFeedComponent } from "./components/social-feed-component/social-feed.component";
import { SocialItemComponent } from "./components/social-item-component/social-item.component";


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: SocialFeedRootComponent,
                children: [
                    {
                        path: "",
                        component: SocialFeedComponent
                    },
                    {
                        path: ":id",
                        component: SocialItemComponent
                    }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})

export class SocialFeedRoutingModule {

}
