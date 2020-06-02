import {SystemMonitoringUrls} from "../../modules/Admin/data/system-monitoring.models";

export const CONFIGS_BASE_URL = './config/';

export type ServicesHealthCheckUrls = {
    [key in keyof ApiUrls]?: {
        name: string;
        url: string;
    }
};

export interface ApiUrls {
    identityUrl: string;
    webSocketUrl: string;
    bitmexREST: string;
    bitmexWS: string;
    polygonREST: string;
    polygonWS: string;
    twelvedataREST: string;
    twelvedataWS: string;
    onadaWS: string;
    coinigyREST: string;
    coinigyWS: string;
    historystorageREST: string;
    scriptEngineUrlREST: string;
    personalInfoREST: string;
    exchangeManagementREST: string;
    fileStorageREST: string;
    eventConsolidatorUserApiREST: string;
    eventConsolidatorAdminApiREST: string;
    eventConsolidatorWebSocket: string;
    eventsLogREST: string;
    shuftiproApiRest: string;
    socialChatREST: string;
    socialForumREST: string;
    notificationREST: string;
    notificationWebSocketUrl: string;
    systemNotificationApiRest: string;
    scriptEngineREST: string;
    userDataStoreREST: string;
    cointelegraphRssFeedREST: string;
    coindeskRssFeedREST: string;
    oandabrokerREST: string;
    userprofileREST: string;
    historydatacollectorREST: string;
    bftAlgoWS: string;
    news: string;
    exchangeOrder: string;
    tradesReporting: string;
    exchangeUserApi: string;
}

export interface AppConfig {
    apiKey: string;
    fileStorageApiKey: string;
    apiUrls: ApiUrls;
    servicesHealthCheckUrls: ServicesHealthCheckUrls;
    endpointsBearerAuthRequired?: string[];
    systemMonitoringUrls: SystemMonitoringUrls;
}

export enum ComponentIdentifier {
    // platform
    alertsWidget = 'alertsWidget',
    tradeManager = "tradeManager",
    trendsWidget = "trendsWidget",
    publicChat = "publicChat",
    privateChat = "privateChat",
    economicCalendar = "economicCalendar",
    notifications = "notifications",
    tradeWidget = "tradeWidget",
    userActivities = "userActivities",

    // component selector
    chart = "chart",
    orderBookChart = "orderBookChart",
    orderBook = "orderBook",
    marketTrades = "marketTrades",
    watchlist = "watchlist",
    breakfreeTradingPro = "breakfreeTradingPro",
    breakfreeTradingDiscovery = "breakfreeTradingDiscovery",
    breakfreeTradingNavigator = "breakfreeTradingNavigator",
    level2View = "level2View",
    news = "news",
    marketView = "marketView",

    // admin
    summary = "summary",
    blockchains = "blockchains",
    currencies = "currencies",
    markets = "markets",
    dataConsolidator = "dataConsolidator",
    wallets = "wallets",
    accounts = "accounts",
    deposits = "deposits",
    withdraws = "withdraws",
    exchangeMembers = "exchangeMembers",
    adminNotifications = "adminNotifications",
    eventConsolidator = "eventConsolidator",
    appMembers = "appMembers",
    adminChat = "adminChat",
    adminForum = "adminForum",
    adminQA = "adminQA",
    adminNews = "adminNews",
    permissionsManager = "permissionsManager",
    restrictionsManager = "restrictionsManager",
    systemMonitoring = "systemMonitoring",
    eventsLog = "eventLog",
    adminOrders = "adminOrders",
    tradesReports = "tradesReports",

    // remaining
    forum = "forum",
    scripting = "scripting",
    historyDataManager = "historyDataManager",
    runningScript = "runningScript",
    scriptEditor = "scriptEditor",
    backtesting = "backtesting",
    newsRss = "newsRss",
    authenticationSettings = "authenticationSettings",
    generalSettings = "generalSettings",
    profileSettings = "profileSettings",
    brokerSettings = "brokerSettings",
}

export type IComponentsConfig<T = boolean> = {
    -readonly [key in  keyof typeof ComponentIdentifier]: T;
};

export interface ComponentsList extends IComponentsConfig<string> {
}
