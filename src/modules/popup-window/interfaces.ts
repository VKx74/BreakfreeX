import {IdentityService} from "@app/services/auth/identity.service";
import {ThemeService} from "@app/services/theme.service";
import {AlertService} from "@alert/services/alert.service";
import {LocalizationService} from "Localization";
import {LinkingMessagesBus} from "@linking/services";
import {TemplatesStorageService} from "@chart/services/templates-storage.service";
import {TimeZoneManager} from "TimeZones";
import {TemplatesDataProviderService} from "@chart/services/templates-data-provider.service";
import {NewsConfigService} from "../News/services/news.config.service";
import {EducationalTipsService} from "@app/services/educational-tips.service";

export interface ISharedProviders {
    identityService: IdentityService;
    themeService: ThemeService;
    alertService: AlertService;
    localizationService: LocalizationService;
    linkingMessageBus: LinkingMessagesBus;
    templatesStorageService: TemplatesStorageService;
    timeZoneManager: TimeZoneManager;
    chartTemplatesDataProviderService: TemplatesDataProviderService;
    newsConfigService: NewsConfigService;
    educationalTipsService: EducationalTipsService;
}
