import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PageHeaderComponent} from './components/page-header/page-header.component';
import {MainContainerComponent} from './components/main-container/main-container.component';
import {EmptyPlaceholderComponent} from './components/empty-placeholder/empty-placeholder.component';
import {AvatarComponent} from './components/avatar/avatar.component';
import {AlertService} from "@alert/services/alert.service";
import {ToasterAlertService} from "@alert/services/toaster-alert.service";
import {FileUploaderModule} from "../file-uploader/file-uploader.module";
import {LandingSidebarComponent} from "./components/landing-sidebar/landing-sidebar.component";
import {LandingSidebarSectionComponent} from "./components/landing-sidebar-section/landing-sidebar-section.component";
import {LandingItemComponent} from "./components/landing-item/landing-item.component";
import {SidebarModule} from "../sidebar/sidebar.module";
import {TagsGroupComponent} from "./components/tags-group/tags-group.component";
import {SharedModule} from "Shared";

const COMPONENTS = [
    PageHeaderComponent,
    MainContainerComponent,
    EmptyPlaceholderComponent,
    AvatarComponent,
    LandingSidebarComponent,
    LandingSidebarSectionComponent,
    LandingItemComponent,
    TagsGroupComponent,
];

@NgModule({
    declarations: [
        ...COMPONENTS
    ],
    imports: [
        CommonModule,
        FileUploaderModule,
        SidebarModule,
        SharedModule,
    ],
    exports: [
        ...COMPONENTS
    ],
    providers: [
        {
            provide: AlertService,
            useFactory: () => {
                return new ToasterAlertService();
            },
        },
    ]
})
export class ForumSharedModule {
}
