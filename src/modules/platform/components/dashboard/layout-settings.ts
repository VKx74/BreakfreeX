import {PopupWindowSharedProvidersKey} from "../../../popup-window/constants";
import {ISharedProviders} from "../../../popup-window/interfaces";
import {IdentityService} from "@app/services/auth/identity.service";
import {ThemeService} from "@app/services/theme.service";
import {AlertService} from "@alert/services/alert.service";
import {LocalizationService} from "Localization";
import {LinkingMessagesBus} from "@linking/services";
import {TemplatesStorageService} from "@chart/services/templates-storage.service";
import {TimeZoneManager} from "TimeZones";
import {TemplatesDataProviderService} from "@chart/services/templates-data-provider.service";
import {NewsConfigService} from "../../../News/services/news.config.service";
import {EducationalTipsService} from "@app/services/educational-tips.service";

// export const LayoutSettings = {
//     showPopinIcon: false,
//     showPopoutIcon: true,
//     reorderEnabled: true,
//     tabControlOffset: 100,
//     selectionEnabled: false,
//     dimensions: {
//         borderWidth: 5,
//         minItemHeight: 380,
//         minItemWidth: 380,
//         headerHeight: 34,
//         dragProxyWidth: 300,
//         dragProxyHeight: 200
//     },
//     popupWindowUrl: `${window.location.origin}${window.location.pathname}#/popup-window`,
//     getCloseTabIcon: () => $(`<i class="crypto-icon crypto-icon-layout-close"></i>`),
//     getCloseIcon: () => $(`<i class="crypto-icon crypto-icon-layout-close"></i>`),
//     getAddComponentBtnIcon: () => $(`<i class="crypto-icon crypto-icon-add"></i>`),
//     getMaximiseIcon: () => $(`<i class="crypto-icon crypto-icon-layout-maximise"></i>`),
//     getMinimiseIcon: () => $(`<i class="crypto-icon crypto-icon-layout-maximise"></i>`),
//     getPopoutIcon: () => $(`<i class="crypto-icon crypto-icon-layout-popup"></i>`),
//     getPopinIcon: () => $(`<i class="crypto-icon crypto-icon-layout-popin"></i>`),
//     openPopupFailureHandler: () => {
//         this._alertService.warning(this._layoutTranslateService.get('openPopupFailed'));
//     },
//     openPopupHook: (popupWindow: Window) => {
//         popupWindow[PopupWindowSharedProvidersKey] = (): ISharedProviders => {
//             return {
//                 identityService: this._injector.get(IdentityService),
//                 themeService: this._injector.get(ThemeService),
//                 alertService: this._injector.get(AlertService),
//                 localizationService: this._injector.get(LocalizationService),
//                 linkingMessageBus: this._injector.get(LinkingMessagesBus),
//                 templatesStorageService: this._injector.get(TemplatesStorageService),
//                 timeZoneManager: this._injector.get(TimeZoneManager),
//                 chartTemplatesDataProviderService: this._injector.get(TemplatesDataProviderService),
//                 newsConfigService: this._injector.get(NewsConfigService),
//                 educationalTipsService: this._injector.get(EducationalTipsService)
//             };
//         };
//     }
// };
