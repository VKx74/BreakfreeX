import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IDEModule} from "../ide/ide.module";
import {UIModule} from "UI";
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {LoadingModule} from "ngx-loading";
import {AdminTranslateService} from "./localization/token";
import {RouterModule} from "@angular/router";
import {AdminDashboardSidebarComponent} from "./components/admin-dashboard-sidebar/admin-dashboard-sidebar.component";
import {AppMembersComponent} from "./components/app-members/app-members.component";
import {AppMemberConfiguratorComponent} from "./components/app-member-configurator/app-member-configurator.component";
import {AppUsersResolver} from "./resolvers/app-users.resolver";
import {AdminRouterModule} from "./admin.router";
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {ProgressBarManager} from "./services/progress-bar-manager";
import {AppMemberInfoComponent} from "./components/app-member-info/app-member-info.component";
import {SharedModule} from "Shared";
import {AdminHelperService} from "./services/admin-helper.service";
import {ExchangeUsersService} from "./services/exchange-users.service";
import {EventConsolidatorComponent} from "./components/event-consolidator/event-consolidator.component";
import {EventEditorComponent} from "./components/event-editor/event-editor.component";
import {EventConsolidatorService} from "./services/event-consolidator.service";
import {EventConsolidatorResolver} from "./resolvers/event-consolidator.resolver";
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatMenuModule} from '@angular/material/menu';
import {TagsManagerComponent} from './components/tags-manager/tags-manager.component';
import {UserTagsService} from "./services/user-tags.service";
import {ThreadManagerComponent} from './components/chat/thread-manager/thread-manager.component';
import {AppMemberKycHistoryComponent} from "./components/app-member-kyc-history/app-member-kyc-history.component";
import {ThreadsResolver} from "./resolvers/threads.resolver";
import {NotificationsComponent} from "./components/notifications/notifications.component";
import {NotificationEditorComponent} from "./components/notification-editor/notification-editor.component";
import {SystemNotificationsResolver} from "./resolvers/system-notifications.resolver";
import {SystemMonitoringComponent} from './components/system-monitoring/system-monitoring.component';
import {ThreadDetailsResolver} from "./resolvers/thread-details.resolver";
import {IframeContainerComponent} from './components/system-monitoring/iframe-container/iframe-container.component';
import {SystemMonitoringMenuComponent} from './components/system-monitoring/system-monitoring-menu/system-monitoring-menu.component';
import {RefreshPasswordComponent} from "./components/refresh-password/refresh-password.component";
import {ScrollerModule} from "@scroller/scroller.module";
import {ServicesHealthCheckComponent} from './components/system-monitoring/services-health-check/services-health-check.component';
import {MarkdownModule} from "../Markdown/markdown.module";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {TagsInputModule} from "@tagsInput/tags-input.module";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {NgxMaterialTimepickerModule} from "ngx-material-timepicker";
import {PaginatorModule} from "@paginator/paginator.module";
import {NavigationModule} from "../navigation/navigation.module";
import {AlertService} from "@alert/services/alert.service";
import {ToasterAlertService} from "@alert/services/toaster-alert.service";
import {PersonalInfoService} from "@app/services/personal-info/personal-info.service";
import {MatTooltipModule} from "@angular/material/tooltip";
import {EventsLogComponent} from "./components/system-monitoring/events-log/events-log.component";
import {BusinessAccountCompanyDirectorComponent} from "./components/app-member-info/business-account-company-director/business-account-company-director.component";
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {ThreadDetailsDialogComponent} from './components/chat/thread-details-dialog/thread-details-dialog.component';
import {ThreadMessagesComponent} from './components/chat/thread-messages/thread-messages.component';
import {ThreadMembersComponent} from './components/chat/thread-members/thread-members.component';
import {ThreadBannedMembersResolver} from "./resolvers/thread-banned-members.resolver";
import {ThreadMembersResolver} from "./resolvers/thread-members.resolver";
import {ThreadMessagesResolver} from "./resolvers/thread-messages.resolver";
import {ForumComponent} from './components/forum/forum.component';
import {JSONViewDialogComponent} from "../Shared/components/json-view/json-view-dialog.component";
import {QAComponent} from './components/qa/qa.component';
import {QuestionsService} from "../Qa/services/questions.service";
import {DiscussionsService} from "../DiscussionForum/services/discussions.service";
import {ForumResolver} from "./resolvers/forum.resolver";
import {QAResolver} from "./resolvers/qa.resolver";
import {UiComponentsPermissionManagerComponent} from './components/ui-permissions-manager/ui-components-permission-manager.component';
import {MatChipsModule} from "@angular/material/chips";
import {AdminPanelMainComponent} from './components/admin-panel-main-page/admin-panel-main-component';
import {UIPermissionsResolver} from "./resolvers/permissions-manager.resolver";
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {NewsManagerComponent} from './components/news-manager/news-manager.component';
import {NewsManagerResolver} from "./resolvers/news-manager.resolver";
import {CreateNewsComponent} from './components/news-manager/create-news/create-news.component';
import {NewsResolver} from "./resolvers/news.resolver";
import {NewsListComponent} from './components/news-manager/news-list/news-list.component';
import {FileUploaderModule} from "../file-uploader/file-uploader.module";
import {FormErrorDirectiveModule} from "@form-error-directive/form-error-directive.module";
import {LastNewsResolver} from "./resolvers/last-news.resolver";
import {EventsLogResolver} from "./resolvers/events-log.resolver";
import {DatatableModule} from "../datatable/datatable.module";
import {InstrumentSearchModule} from "@instrument-search/instrument-search.module";
import {RunningScriptsComponent} from './components/running-scripts/running-scripts.component';
import {RunningScriptsResolver} from "./resolvers/running-scripts.resolver";
import {ScriptingModule} from "@scripting/scripting.module";
import {ShuftiproAccountManagerModule} from "../shuftipro-account-manager/shuftipro-account-manager.module";
import {FooterComponent} from "./components/footer/footer.component";
import {CreateThreadComponent} from "../UI/components/create-thread/create-thread.component";
import {MatRadioModule} from "@angular/material/radio";
import {MatTabsModule} from "@angular/material/tabs";
import {AppMemberKycInfoComponent} from './components/app-member-kyc-info/app-member-kyc-info.component';
import {PaginationTableContainerComponent} from './components/pagination-table-container/pagination-table-container.component';
import {MatButtonModule} from "@angular/material/button";
import {PlatformModule} from "@platform/platform.module";
// import {AuthModule} from "../Auth/auth.module";
import {MatSidenavModule} from "@angular/material/sidenav";
import {SidebarModule} from "../sidebar/sidebar.module";
import {AdminSidebarComponent} from "./components/admin-sidebar/admin-sidebar.component";
import {AdminNavComponent} from './components/admin-nav/admin-nav.component';
import {AdminComponent} from "./components/admin/admin.component";
import {ProfileActivitiesModule} from "../user-settings/profile-activities.module";
import {IdentityLogsService} from "@app/services/identity-logs.service";
import {UserSettingsResolver} from "@app/services/user-settings.resolver";
import {SharedTranslateService} from "@app/localization/shared.token";
import {TimeZonesModule} from "TimeZones";
import {TranslateModule} from "@ngx-translate/core";
import {FormErrorProviderFactory} from "@app/helpers/form-error-provider.factory";
import {ErrorProviderToken} from "@form-error-directive/error-provider.token";
import {ForumCategoriesComponent} from "./components/forum-categories/forum-categories.component";
import {ForumCategoriesResolver} from "./resolvers/forum-categories.resolver";
import {ForumCategoryConfiguratorComponent} from "./components/forum-category-configurator/forum-category-configurator.component";
import {DiscussionForumApiService} from "../DiscussionForum/services/api.service";
import {MatTableModule} from "@angular/material/table";
import {ChatModuleForAdmin} from "../Chat/chat.module";
import {UploadFileInputConfig} from "@file-uploader/components/upload-file-input/upload-file-input-config.token";
import {IUploadFileInputConfig} from "@file-uploader/components/upload-file-input/upload-file-input.component";
import {UploadFile} from "@file-uploader/data/UploadFIle";
import { LayoutStorageService } from '@app/services/layout-storage.service';
import { AppMemberXpInfoComponent } from './components/app-member-xp-info/app-member-xp-info.component';
import { XPDashboardComponent } from './components/xp-dashboard/xp-dashboard.component';
import { XPDashboardResolver } from './resolvers/xp-dashboard.resolver';
import { RegistrationsDashboardComponent } from './components/registrations-dashboard/registrations-dashboard.component';
import { TPMonitoringComponent } from './components/trading-performance-monitoring/tp-monitoring.component';
import { TPMonitoringService } from './services/tp-monitoring.service';
import { TPMonitoringUserDataComponent } from './components/trading-performance-monitoring/tp-monitoring-user-data/tp-monitoring-user-data.component';
import { SPChartComponent } from './components/trading-performance-monitoring/chart-components/single-parameter-chart/sp-chart.component.';
import { TPMonitoringResolver } from './resolvers/tp-monitoring.resolver';
import { TPMonitoringGeneralDataComponent } from './components/trading-performance-monitoring/tp-monitoring-general-data/tp-monitoring-general-data.component';
import { LoaderModule } from 'modules/loader/loader.module';
import { TPMonitoringTradeDetailsComponent } from './components/trading-performance-monitoring/tp-monitoring-trade-details/tp-monitoring-trade-details.component';
import { TPMonitoringAlgoTradesDetsComponent } from './components/trading-performance-monitoring/tp-monitorinng-algo-trades-detais/tp-monitoring-at-det.component';
import { TPMonitoringTradesHistComponent } from './components/trading-performance-monitoring/tp-monitoring-trades-hist/tp-monitoring-trades-hist.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { AppMemberTradingAccountsComponent } from './components/app-member-trading-accounts/app-member-trading-accounts.component';
import { AppMemberTradingAccountEditComponent } from './components/app-member-trading-account-edit/app-member-trading-account-edit.component';
import { CompanionWalletsComponent } from './components/companion/wallets/companion-wallets.component';
import { ScriptCloudRepositoryService } from '@scripting/services/script-cloud-repository.service';
import { CompanionComponent } from './components/companion/companion.component';
import { CompanionWalletDetailsComponent } from './components/companion/wallet-details/companion-wallet-details.component';
import { CompanionWalletDetailsResolver } from './resolvers/companion-wallet-details.resolver';
import { CompanionWalletDepositComponent } from './components/companion/wallet-deposit/companion-wallet-deposit.component';
import { CompanionWalletWithdrawTableComponent } from './components/companion/wallet-withdraw-table/companion-wallet-withdraw-table.component';
import { CompanionWalletBalanceComponent } from './components/companion/wallet-balance/companion-wallet-balance.component';
import { CompanionWalletBalanceItemComponent } from './components/companion/wallet-balance-item/companion-wallet-balance-item.component';
import { CompanionWalletReturnsComponent } from './components/companion/wallet-returns/companion-wallet-returns.component';
import { CompanionEditWalletDepositComponent } from './components/companion/edit-wallet-deposit/companion-edit-wallet-deposit.component';
import { CompanionEditWalletWithdrawComponent } from './components/companion/edit-wallet-withdraw/companion-edit-wallet-withdraw.component';
import { CompanionWalletEndDateDepositComponent } from './components/companion/wallet-end-date-deposit/companion-wallet-end-date-deposit.component';
import { CompanionEditEndDateWalletDepositComponent } from './components/companion/edit-wallet-end-date-deposit/companion-edit-wallet-end-date-deposit.component';
import { CompanionFinanceComponent } from './components/companion/companion-finance/companion-finance.component';
import { CompanionEndedEndDateDepositsComponent } from './components/companion/ended-end-date-deposits/companion-ended-end-date-deposits.component';
import { CompanionWalletEndDateDepositTableComponent } from './components/companion/wallet-end-date-deposit-table/companion-wallet-end-date-deposit-table.component';
import { CompanionWalletWithdrawComponent } from './components/companion/wallet-withdraw/companion-wallet-withdraw.component';
import { RequestedWithdrawsComponent } from './components/companion/requested-withdraws/requested-withdraws.component';
import { RedeemsComponent } from './components/companion/redeems/redeems.component';
import { RedeemsTableComponent } from './components/companion/redeems-table/redeems-table.component';
import { AddRedeemComponent } from './components/companion/add-redeem/add-redeem.component';
import { NumericInputModule } from '@numeric-input/numeric-input.module';
import { ForgotPinComponent } from './components/companion/forgot-pin/forgot-pin.component';
import { ForgotPinTableComponent } from './components/companion/forgot-pin-table/forgot-pin-table.component';
import { TransferLogsComponent } from './components/companion/transfer-logs/transfer-logs.component';
import { TransferLogsTableComponent } from './components/companion/transfer-logs-table/transfer-logs-table.component';
import { AddEndDateDepositComponent } from './components/companion/add-end-date-deposit/add-end-date-deposit.component';
import { AddFlexibleDepositComponent } from './components/companion/add-flexible-deposit/add-flexible-deposit.component';
import { P2PAccountsComponent } from './components/companion/p2p-accounts/p2p-accounts.component';
import { P2PAccountsTableComponent } from './components/companion/p2p-accounts-table/p2p-accounts-table.component';
import { P2PKYCAccountsComponent } from './components/companion/p2p-kyc-accounts/p2p-kyc-accounts.component';
import { P2PAdsComponent } from './components/companion/p2p-ads/p2p-ads.component';
import { P2PAdsTableComponent } from './components/companion/p2p-ads-table/p2p-ads-table.component';
import { AdDetailsComponent } from './components/companion/ad-details/ad-details.component';
import { AdDetailsResolver } from './resolvers/ad-details.resolver';
import { P2POrdersTableComponent } from './components/companion/p2p-orders-table/p2p-orders-table.component';
import { P2PAdOrdersComponent } from './components/companion/p2p-ad-orders/p2p-ad-orders.component';
import { P2PDisputeOrdersComponent } from './components/companion/p2p-dispute-orders/p2p-dispute-orders.component';
import { P2PAccountDetailsComponent } from './components/companion/p2p-account-details/p2p-account-details.component';
import { P2PAccountDetailsResolver } from './resolvers/p2p-account-details.resolver';
import { P2PAccountKYCComponent } from './components/companion/p2p-account-kyc/p2p-account-kyc.component';
import { KYCStatusChangeComponent } from './components/companion/p2p-kyc-status-change/p2p-kyc-status-change.component';
import { P2PUserOrdersComponent } from './components/companion/p2p-user-orders/p2p-user-orders.component';
import { P2PUserHistoricalOrdersComponent } from './components/companion/p2p-user-historical-orders/p2p-historical-user-orders.component';
import { P2PUserAdsComponent } from './components/companion/p2p-user-ads/p2p-user-ads.component';
import { P2PUserHistoricalAdsComponent } from './components/companion/p2p-user-historical-ads/p2p-user-historical-ads.component';
import { P2PUserReviewsTableComponent } from './components/companion/p2p-user-reviews-table/p2p-user-reviews-table.component';
import { P2PUserReviewsComponent } from './components/companion/p2p-user-reviews/p2p-user-reviews.component';
import { P2PEditOrderComponent } from './components/companion/p2p-edit-order/p2p-edit-order.component';
import { P2PEditAdComponent } from './components/companion/p2p-edit-ad/p2p-edit-ad.component';

@NgModule({
    imports: [
        LocalizationModule.forRoot(),
        TranslateModule.forRoot(),

        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IDEModule,
        LocalizationModule,
        LoadingModule,
        UIModule,

        MarkdownModule,
        NavigationModule,

        MatInputModule,
        MatSelectModule,
        TagsInputModule,
        MatRadioModule,
        MatDatepickerModule,
        NgxMaterialTimepickerModule,
        MatTooltipModule,
        PaginatorModule,
        EducationalTipsModule,

        MatSidenavModule,

        SharedModule,
        AdminRouterModule,
        MatProgressBarModule,
        MatSlideToggleModule,
        MatMenuModule,
        ScrollerModule,
        MatAutocompleteModule,
        MatChipsModule,
        FileUploaderModule,
        FormErrorDirectiveModule,
        DatatableModule,
        InstrumentSearchModule,
        ScriptingModule.forAdmin(),
        ShuftiproAccountManagerModule,
        MatTabsModule,
        ProfileActivitiesModule.forAdminArea(),
        MatButtonModule,
        SidebarModule,
        MatTableModule,
        ChatModuleForAdmin,
        LoaderModule,
        MatPaginatorModule,
        MatExpansionModule,
        NumericInputModule
    ],
    declarations: [
        AdminDashboardSidebarComponent,
        AppMembersComponent,
        AppMemberInfoComponent,
        AppMemberTradingAccountsComponent,
        AppMemberTradingAccountEditComponent,
        AppMemberConfiguratorComponent,
        NotificationsComponent,
        NotificationEditorComponent,
        EventConsolidatorComponent,
        EventEditorComponent,
        AdminComponent,

        TagsManagerComponent,
        AppMemberKycHistoryComponent,
        ThreadManagerComponent,
        SystemMonitoringComponent,
        IframeContainerComponent,
        SystemMonitoringMenuComponent,
        ServicesHealthCheckComponent,
        EventsLogComponent,
        RefreshPasswordComponent,
        BusinessAccountCompanyDirectorComponent,
        ThreadDetailsDialogComponent,
        ThreadMessagesComponent,
        ThreadMembersComponent,
        ForumComponent,
        XPDashboardComponent,
        RegistrationsDashboardComponent,        
        TPMonitoringComponent,
        TPMonitoringUserDataComponent,
        TPMonitoringTradeDetailsComponent,
        TPMonitoringGeneralDataComponent,
        TPMonitoringAlgoTradesDetsComponent,
        TPMonitoringTradesHistComponent,
        SPChartComponent,
        QAComponent,
        UiComponentsPermissionManagerComponent,
        AdminPanelMainComponent,
        NewsManagerComponent,
        CreateNewsComponent,
        NewsListComponent,
        RunningScriptsComponent,
        FooterComponent,
        AppMemberKycInfoComponent,
        AppMemberXpInfoComponent,
        PaginationTableContainerComponent,
        AdminSidebarComponent,
        AdminNavComponent,
        ForumCategoriesComponent,
        ForumCategoryConfiguratorComponent,
        
        CompanionComponent,
        CompanionWalletsComponent,
        CompanionEndedEndDateDepositsComponent,
        RequestedWithdrawsComponent,
        RedeemsComponent,
        ForgotPinComponent,
        AddEndDateDepositComponent,
        AddFlexibleDepositComponent,
        TransferLogsComponent,
        RedeemsTableComponent,
        ForgotPinTableComponent,
        TransferLogsTableComponent,
        CompanionFinanceComponent,
        CompanionWalletDetailsComponent,
        CompanionWalletDepositComponent,
        CompanionWalletEndDateDepositComponent,
        CompanionWalletWithdrawComponent,
        CompanionWalletWithdrawTableComponent,
        CompanionWalletBalanceComponent,
        CompanionWalletBalanceItemComponent,
        CompanionWalletReturnsComponent,
        CompanionEditWalletDepositComponent,
        CompanionEditEndDateWalletDepositComponent,
        CompanionWalletEndDateDepositTableComponent,
        CompanionEditWalletWithdrawComponent,
        AddRedeemComponent,
        KYCStatusChangeComponent,

        P2PAccountsComponent,
        P2PKYCAccountsComponent,
        P2PAccountsTableComponent,
        P2PAdsComponent,
        P2PAdsTableComponent,
        P2PAdOrdersComponent,
        P2POrdersTableComponent,
        P2PDisputeOrdersComponent,
        
        AdDetailsComponent,
        P2PAccountDetailsComponent,

        P2PAccountKYCComponent,
        P2PUserOrdersComponent,
        P2PUserHistoricalOrdersComponent,
        P2PUserAdsComponent,
        P2PUserHistoricalAdsComponent,

        P2PUserReviewsComponent,
        P2PUserReviewsTableComponent,
        P2PEditOrderComponent,
        P2PEditAdComponent
    ],
    exports: [
        RouterModule,
        PaginationTableContainerComponent,
        NewsListComponent,        
        // FileUploaderModalComponent
    ],
    entryComponents: [
        AppMemberConfiguratorComponent,
        EventEditorComponent,
        AppMemberInfoComponent,
        AppMemberTradingAccountsComponent,
        AppMemberTradingAccountEditComponent,
        TagsManagerComponent,
        AppMemberKycHistoryComponent,
        NotificationEditorComponent,
        RefreshPasswordComponent,
        ThreadDetailsDialogComponent,
        JSONViewDialogComponent,
        CreateThreadComponent,
        ForumCategoryConfiguratorComponent,
        TPMonitoringTradeDetailsComponent,
        CompanionWalletReturnsComponent,
        CompanionEditWalletDepositComponent,
        CompanionWalletEndDateDepositTableComponent,
        CompanionEditEndDateWalletDepositComponent,
        CompanionEditWalletWithdrawComponent,
        AddRedeemComponent,
        CompanionWalletsComponent,
        AddEndDateDepositComponent,
        AddFlexibleDepositComponent,
        KYCStatusChangeComponent,
        P2PEditOrderComponent,
        P2PEditAdComponent
        // CreateNewsComponent,
    ],
    providers: [
        AppUsersResolver,
        EventConsolidatorResolver,
        SystemNotificationsResolver,
        ThreadsResolver,
        XPDashboardResolver,
        TPMonitoringResolver,
        ThreadMembersResolver,
        ThreadDetailsResolver,
        ThreadMessagesResolver,
        ThreadBannedMembersResolver,
        ForumResolver,
        QAResolver,
        ExchangeUsersService,
        AdminHelperService,
        EventConsolidatorService,
        UserTagsService,
        TPMonitoringService,
        LayoutStorageService,
        // UserSettingsResolver,
        {
            provide: SharedTranslateService,
            useFactory: TranslateServiceFactory('shared'),
            deps: [Injector]
        },
        UserSettingsResolver,
        ForumCategoriesResolver,
        {
            provide: AdminTranslateService,
            useFactory: TranslateServiceFactory('admin'),
            deps: [Injector]
        },
        {
            provide: AlertService,
            useFactory: () => {
                return new ToasterAlertService();
            },
        },
        {
            provide: UploadFileInputConfig,
            useFactory: (alertService: AlertService) => {
                return {
                    maxSizeMb: 5,
                    maxFileSizeMb: 5,
                    allowedFiles: [], // all files
                    allowMultipleFiles: false,
                    incorrectFileSizeHandler: (file: UploadFile | UploadFile[], maxFileSizeMB: number) => {
                        alertService.warning(`File has incorrect size. Max allowed size: ${maxFileSizeMB} MB`);
                    },
                    incorrectFileTypeHandler: (file: UploadFile | UploadFile[], allowedTypes: string[]) => {
                        alertService.warning(`File has incorrect type. Allowed types: ${allowedTypes.join(', ')}`);
                    }
                } as IUploadFileInputConfig;
            },
            deps: [
                AlertService
            ]
        },
        {
            provide: ErrorProviderToken,
            useFactory: FormErrorProviderFactory,
            deps: [SharedTranslateService]
        },

        PersonalInfoService,
        ProgressBarManager,
        QuestionsService,
        DiscussionsService,
        UIPermissionsResolver,
        NewsManagerResolver,
        NewsResolver,
        LastNewsResolver,
        EventsLogResolver,
        RunningScriptsResolver,
        IdentityLogsService,
        DiscussionForumApiService,
        IdentityLogsService,

        CompanionWalletDetailsResolver,
        ScriptCloudRepositoryService,
        AdDetailsResolver,
        P2PAccountDetailsResolver
    ]
})
export class AdminModule {

}
