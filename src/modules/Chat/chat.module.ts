import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PublicChatComponent} from './components/public-chat/public-chat.component';
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {ChatTranslateService} from "./localization/token";
import {UIModule} from "UI";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "Shared";
import {ThreadListComponent} from './components/thread-list/thread-list.component';
import {LoadingModule} from "ngx-loading";
import {ActiveThreadComponent} from './components/active-thread/active-thread.component';
import {ThreadMessageComponent} from './components/thread-message/thread-message.component';
import {ThreadMembersModalComponent} from './components/thread-members-modal/thread-members-modal.component';
import {TagsInputModule} from "@tagsInput/tags-input.module";
import {MatMenuModule} from "@angular/material/menu";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatListModule} from "@angular/material/list";
import {MatInputModule} from "@angular/material/input";
import {
    ThreadConfiguratorComponent
} from './components/thread-configurator/thread-configurator.component';
import {PrivateChatComponent} from "./components/private-chat/private-chat.component";
import {ChatComponent} from './components/chat/chat.component';
import {FileInfoSimpleComponent} from 'modules/Chat/components/file-info-simple.component/file-info-simple.component';
import {FileUploaderModule} from 'modules/file-uploader/file-uploader.module';
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {FormErrorDirectiveModule} from "@form-error-directive/form-error-directive.module";
import {SharedTranslateService} from "@app/localization/shared.token";
import {FileUploaderModalComponent} from "../file-uploader/components/file-uploader-modal/file-uploader-modal.component";
import {ChatFileUploaderComponent} from "./components/chat-file-uploader/chat-file-uploader.component";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {ThreadListItemComponent} from './components/thread-list-item/thread-list-item.component';
import {StoreModule} from "@ngrx/store";
import {reducer} from "./store/reducers";
import {EffectsModule} from "@ngrx/effects";
import {ChatEffects} from "./store/effects/effects";
import {ChatApiService} from "./services/chat.api.service";
import {InfinityLoaderModule} from "../infinity-loader/infinity-loader.module";
import {ChatNotificationsEffects} from "./store/effects/notifications-effects";
import {ChatHelperService} from "./services/chat-helper.service";
import {AngularSplitModule} from "angular-split";
import {InviteMembersModalComponent} from './components/invite-members-modal/invite-members-modal.component';
import {PublicChatLayoutWidgetComponent} from "./components/public-chat-layout-widget/public-chat-layout-widget.component";
import {PrivateChatLayoutWidgetComponent} from "./components/private-chat-layout-widget/private-chat-layout-widget.component";

@NgModule({
    declarations: [
        ThreadConfiguratorComponent
    ],
    imports: [
        CommonModule,
        FileUploaderModule,
        UIModule,
        FormsModule,
        SharedModule,
        LocalizationModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatInputModule,
        FormErrorDirectiveModule,
    ],
    exports: [
        ThreadConfiguratorComponent
    ],
    entryComponents: [
        ThreadConfiguratorComponent
    ],
    providers: [
        {
            provide: ChatTranslateService,
            useFactory: TranslateServiceFactory('chat'),
            deps: [Injector, SharedTranslateService]
        }
    ]
})
export class ThreadConfiguratorComponentModule {
}


@NgModule({
    declarations: [
        PublicChatComponent,
        PrivateChatComponent,
        ThreadListComponent,
        ActiveThreadComponent,
        ThreadMessageComponent,
        InviteMembersModalComponent,
        ThreadMembersModalComponent,
        ChatComponent,
        ThreadListItemComponent,
        PublicChatLayoutWidgetComponent,
        PrivateChatLayoutWidgetComponent,
    ],
    imports: [
        CommonModule,
        UIModule,
        FormsModule,
        SharedModule,
        LoadingModule,
        LocalizationModule,
        MatListModule,
        TagsInputModule,
        MatMenuModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        FileUploaderModule,
        EducationalTipsModule,
        MatInputModule,
        FormErrorDirectiveModule,
        MatProgressBarModule,
        StoreModule.forFeature('chats', reducer),
        EffectsModule.forFeature([ChatEffects, ChatNotificationsEffects]),
        ThreadConfiguratorComponentModule,
        InfinityLoaderModule,
        AngularSplitModule.forChild()
    ],
    exports: [
        PublicChatComponent,
        PrivateChatComponent,
        PublicChatLayoutWidgetComponent,
        PrivateChatLayoutWidgetComponent,
        FileUploaderModalComponent,
    ],
    entryComponents: [
        PublicChatComponent,
        PrivateChatComponent,
        PublicChatLayoutWidgetComponent,
        PrivateChatLayoutWidgetComponent,
        InviteMembersModalComponent,
        ThreadMembersModalComponent,
    ],
    providers: [
        {
            provide: ChatTranslateService,
            useFactory: TranslateServiceFactory('chat'),
            deps: [Injector, SharedTranslateService]
        },

        ChatApiService,
        ChatHelperService,
    ]
})
export class ChatModule {
}

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        ThreadConfiguratorComponentModule
    ],
    exports: [],
    entryComponents: [],
    providers: [
        {
            provide: ChatTranslateService,
            useFactory: TranslateServiceFactory('chat'),
            deps: [Injector, SharedTranslateService]
        }
    ]
})
export class ChatModuleForAdmin {
}
