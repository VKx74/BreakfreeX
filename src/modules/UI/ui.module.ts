import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ResizeSensorDirective} from "./directives/resize-sensor";
import {ConfirmModalComponent} from "./components/confirm-modal/confirm-modal.component";
import {ComingSoonComponent} from "./components/coming-soon/coming-soon.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HighlightDirective} from "./directives/highlight.directive";
import {SelectorComponent} from "./components/selector/selector.component";
import {PinInputComponent} from "./components/pin-input/pin-input.component";
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {UITranslateService} from "./localization/token";
import {
    ManualSearchComponent,
    ManualSearchInputDirective,
    ManualSearchTriggerDirective
} from "./components/manual-search/manual-search.component";
import {MenuToggleComponent} from './components/menu-toggle/menu-toggle.component';
import {EmojiPickerComponent} from './components/emoji-picker/emoji-picker.component';
import {NameAvatarComponent} from './components/name-avatar/name-avatar.component';
import {ScrollableDirective} from "./directives/scrollable.directive";
import {InputModalComponent} from './components/input-modal/input-modal.component';
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {PaginatorModule} from "@paginator/paginator.module";
import {TagsInputModule} from "@tagsInput/tags-input.module";
import {MatSelectModule} from "@angular/material/select";
import {MatMenuModule} from "@angular/material/menu";
import {DebouncedInputComponent} from "./components/debounced-input/debounced-input.component";
import {SearchInputComponent} from "./components";
import {OnEnterDirectiveModule} from "@on-enter/on-enter-directive.module";
import {FormErrorDirectiveModule} from "@form-error-directive/form-error-directive.module";
import {SharedTranslateService} from "@app/localization/shared.token";
import {AutocompleteSearchComponent} from "./components/autocomplete-search/autocomplete-search.component";
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {PinInputModalComponent} from './components/pin-input-modal/pin-input-modal.component';
import {CreateThreadComponent} from "./components/create-thread/create-thread.component";
import {ChatTranslateService} from "../Chat/localization/token";
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {SharedModule} from "Shared";
import {PaginationButtonsComponent} from './components/pagination-buttons/pagination-buttons.component';
import {IndicatorComponent} from "./components/indicator/indicator.component";
import { HeaderComponent } from './components/header/header.component';
import { SvgEmptyComponent } from '../Shared/components/svg-empty/svg-empty.component';
import { TooltipDirective } from './directives/tooltip.directive';
import { EmojiComponent } from './components/emoji/emoji.component';
import { ChartWrapperComponent } from './components/chartWrapper/chart-wrapper.component';
import { BadgeComponent, MyBadgeComponent } from './components/badge/badge.component';
import { StaticBadgeComponent } from './components/static-badge/static-badge.component';
import { PercentageInputModalComponent } from './components/percentage-input-modal/percentage-input-modal.component';
import { NumericInputModule } from '@numeric-input/numeric-input.module';
import { TradingDirectionModalComponent } from './components/trading-direction-input-modal/trading-direction-input-modal.component';

@NgModule({
    declarations: [
        ResizeSensorDirective,
        ConfirmModalComponent,
        // SearchInputComponent,
        HighlightDirective,
        ComingSoonComponent,
        SelectorComponent,
        PinInputComponent,
        ManualSearchComponent,
        ManualSearchInputDirective,
        ManualSearchTriggerDirective,
        TooltipDirective,
        MenuToggleComponent,
        EmojiPickerComponent,
        NameAvatarComponent,
        ScrollableDirective,
        InputModalComponent,
        PercentageInputModalComponent,
        TradingDirectionModalComponent,
        DebouncedInputComponent,
        SearchInputComponent,
        AutocompleteSearchComponent,
        CreateThreadComponent,
        PaginationButtonsComponent,
        IndicatorComponent,
        HeaderComponent,
        PinInputModalComponent,
        EmojiComponent,
        ChartWrapperComponent,
        MyBadgeComponent,
        BadgeComponent,
        StaticBadgeComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        LocalizationModule,
        OnEnterDirectiveModule,
        FormErrorDirectiveModule,

        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatMenuModule,

        PaginatorModule,
        TagsInputModule,
        MatAutocompleteModule,
        MatSlideToggleModule,
        SharedModule,

        NumericInputModule
    ],
    exports: [
        ResizeSensorDirective,
        ConfirmModalComponent,
        HighlightDirective,
        ComingSoonComponent,
        SelectorComponent,
        PinInputComponent,
        ManualSearchComponent,
        ManualSearchInputDirective,
        ManualSearchTriggerDirective,
        TooltipDirective,
        MenuToggleComponent,
        EmojiPickerComponent,
        NameAvatarComponent,
        ScrollableDirective,
        DebouncedInputComponent,
        SearchInputComponent,
        AutocompleteSearchComponent,
        PinInputModalComponent,
        CreateThreadComponent,
        PaginationButtonsComponent,
        IndicatorComponent,
        HeaderComponent,
        EmojiComponent,
        ChartWrapperComponent,
        MyBadgeComponent,
        BadgeComponent,
        StaticBadgeComponent
    ],
    entryComponents: [
        ConfirmModalComponent,
        InputModalComponent,
        PercentageInputModalComponent,
        TradingDirectionModalComponent,
        PinInputModalComponent
    ],
    providers: [
        {
            provide: UITranslateService,
            useFactory: TranslateServiceFactory('ui'),
            deps: [Injector, SharedTranslateService]
        },
        {
            provide: ChatTranslateService,
            useFactory: TranslateServiceFactory('chat'),
            deps: [Injector, SharedTranslateService]
        },
    ]
})
export class UIModule {
}
