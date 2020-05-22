
import {ModuleWithProviders, NgModule} from "@angular/core";
import {LinkingMessagesBus} from "./services";
import {LinkerFactory} from "./linking-manager";
import {LinkSelectorComponent} from "./components";
import {MatMenuModule} from "@angular/material/menu";
import {CommonModule} from "@angular/common";
import {sharedProviderResolver} from "../popup-window/functions";

export function sharedLinkingMessageBus() {
    return sharedProviderResolver('linkingMessageBus');
}

@NgModule({
    imports: [
        CommonModule,
        MatMenuModule
    ],
    declarations: [
        LinkSelectorComponent
    ],
    exports: [
        LinkSelectorComponent
    ],
    entryComponents: [
        LinkSelectorComponent
    ],
    providers: [

    ]
})
export class LinkingModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: LinkingModule,
            providers: [
                LinkingMessagesBus,
                LinkerFactory
            ]
        };
    }

    static forPopupRoot(): ModuleWithProviders {
        return {
            ngModule: LinkingModule,
            providers: [
                {
                    provide: LinkingMessagesBus,
                    useFactory: sharedLinkingMessageBus
                },
                LinkerFactory
            ]
        };
    }
}
