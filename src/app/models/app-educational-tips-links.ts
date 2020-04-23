import {ComponentIdentifier} from './app-config';

export interface IAppEducationalTipsLinks {
    // widgets
    [ComponentIdentifier.alertsWidget]: string;
    [ComponentIdentifier.tradeManager]: string;
    [ComponentIdentifier.trendsWidget]: string;
    [ComponentIdentifier.publicChat]: string;
    [ComponentIdentifier.privateChat]: string;
    [ComponentIdentifier.economicCalendar]: string;
    [ComponentIdentifier.notifications]: string;
    [ComponentIdentifier.tradeWidget]: string;
    [ComponentIdentifier.scripting]: string;
    [ComponentIdentifier.historyDataManager]: string;
    [ComponentIdentifier.runningScript]: string;
    [ComponentIdentifier.scriptEditor]: string;
    [ComponentIdentifier.backtesting]: string;

    // component selector
    // [ComponentIdentifier.chart]: TradingChartDesigner.IHelpLinks;
    [ComponentIdentifier.orderBookChart]: string;
    [ComponentIdentifier.orderBook]: string;
    [ComponentIdentifier.marketTrades]: string;
    [ComponentIdentifier.watchlist]: string;
    [ComponentIdentifier.news]: string;
    [ComponentIdentifier.marketView]: string;

    // admin
    [ComponentIdentifier.summary]: string;
    [ComponentIdentifier.blockchains]: string;
    [ComponentIdentifier.currencies]: string;
    [ComponentIdentifier.markets]: string;
    [ComponentIdentifier.dataConsolidator]: string;
    [ComponentIdentifier.wallets]: string;
    [ComponentIdentifier.deposits]: string;
    [ComponentIdentifier.withdraws]: string;
    [ComponentIdentifier.exchangeMembers]: string;
    [ComponentIdentifier.adminNotifications]: string;
    [ComponentIdentifier.eventConsolidator]: string;
    [ComponentIdentifier.appMembers]: string;
    [ComponentIdentifier.adminChat]: string;
    [ComponentIdentifier.adminForum]: string;
    [ComponentIdentifier.adminQA]: string;
    [ComponentIdentifier.permissionsManager]: string;
    [ComponentIdentifier.eventsLog]: string;

    // settings
    [ComponentIdentifier.generalSettings]: string;
    [ComponentIdentifier.profileSettings]: string;
    [ComponentIdentifier.newsRss]: string;
    [ComponentIdentifier.brokerSettings]: string;
    [ComponentIdentifier.authenticationSettings]: string;
}