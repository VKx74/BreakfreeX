import {NgModule} from '@angular/core';
import {DateFormatPipe} from "./pipes/date.pipe";
import {PropertyPipe} from "./pipes/property.pipe";
import {CheckRolePipe} from "./pipes/check-role.pipe";
import {ShowIfRoleDirective} from "./directives/showIfRole.directive";
import {HideIfRoleDirective} from "./directives/hideIfRole.directive";
import {ModalSpinnerPlaceholderComponent} from './components/modal-spinner-placeholder/modal-spinner-placeholder.component';
import {TimeAgoPipe} from "./pipes/time-ago.pipe";
import {ShortNumberPipe} from "./pipes/shortNumber";
import {StatusCodeColorPipe} from './pipes/status-code-color.pipe';
import {PlaceholderComponent} from './components/placeholder/placeholder.component';
import {AppTranslatePipe} from "./pipes/app-translate.pipe";
import {CommonModule} from "@angular/common";
import {EllipsisAfterPipe} from './pipes/ellipsis-after.pipe';
import {LocalTimePipe} from './pipes/local-time.pipe';
import {UrlPathPipe} from './pipes/url-path.pipe';
import {JSONViewDialogComponent} from "./components/json-view/json-view-dialog.component";
import {TabContainerComponent} from "./components/tab-container/tab-container.component";
import {MemoizePipe} from './pipes/memoize.pipe';
import {ShowByTagDirective} from './directives/show-by-tag.directive';
import {UTCSecondsToLocalPipe} from "./pipes/utc-seconds-to-local.pipe";
import {NumericEnumNameByValuePipe} from './pipes/numeric-enum-name-by-value.pipe';
import {StringEnumNameByValuePipe} from './pipes/string-enum-name-by-value.pipe';
import {RemoveButtonComponent} from './components/remove-button/remove-button.component';
import {LocalizationModule} from "Localization";
import {ComponentPreloaderComponent} from './components/component-preloader/component-preloader.component';
import {ClickOutsideDirective} from './directives/click-outside.directive';
import {NumberRangeColorDirective} from './directives/number-range-color.directive';
import {MatTabsModule} from "@angular/material/tabs";
import {RouterModule} from "@angular/router";
import {NumberColorDirective} from './directives/number-color.directive';
import {NoItemsPlaceholderComponent} from "./components/no-items-placeholder/no-items-placeholder.component";
import {DeferLoadDirective} from "./directives/defer-load.directive";
import {SvgEmptyComponent} from "./components/svg-empty/svg-empty.component";
import {BreadcrumbsComponent} from "./components/breadcrumbs/breadcrumbs.component";
import {LoadingModule} from "ngx-loading";
import {LoaderModule} from "../loader/loader.module";
import { PrivacyPolicyTradingModalComponent } from './components/privacy-policy-trading/privacy-policy-trading.component';
import { UTCSecondsToDTPipe } from './pipes/utc-seconds-to-dt.pipe';
import { SecondsToTFPipe } from './pipes/seconds-to-tf.pipe';

const PIPES = [
    DateFormatPipe,
    PropertyPipe,
    CheckRolePipe,
    TimeAgoPipe,
    ShortNumberPipe,
    AppTranslatePipe,
    EllipsisAfterPipe,
    StatusCodeColorPipe,
    LocalTimePipe,
    UrlPathPipe,
    MemoizePipe,
    UTCSecondsToLocalPipe,
    UTCSecondsToDTPipe,
    SecondsToTFPipe
];

const DIRECTIVES = [
    ShowIfRoleDirective,
    HideIfRoleDirective,
    ShowByTagDirective,
    ClickOutsideDirective,
    NumberRangeColorDirective,
    DeferLoadDirective,
];

const COMPONENTS = [
    ModalSpinnerPlaceholderComponent,
    PlaceholderComponent,
    JSONViewDialogComponent,
    ModalSpinnerPlaceholderComponent,
    TabContainerComponent,
    NumericEnumNameByValuePipe,
    StringEnumNameByValuePipe,
    RemoveButtonComponent,
    ComponentPreloaderComponent,
    NoItemsPlaceholderComponent,
    SvgEmptyComponent,
    PrivacyPolicyTradingModalComponent
];

@NgModule({
    declarations: [
        ...PIPES,
        ...DIRECTIVES,
        ...COMPONENTS,
        NumberRangeColorDirective,
        NumberColorDirective,
        BreadcrumbsComponent
    ],
    providers: [],
    imports: [
        CommonModule,
        LocalizationModule,
        MatTabsModule,
        RouterModule,
        LoadingModule,
        LoaderModule,
    ],
    exports: [
        ...PIPES,
        ...DIRECTIVES,
        ...COMPONENTS,
        NumberColorDirective,
        BreadcrumbsComponent
    ]
})
export class SharedModule {
}
