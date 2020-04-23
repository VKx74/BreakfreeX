import {ForumType} from "../enums/enums";
import {Data} from "@angular/router";

export const ForumTypeUrls = new Map([
    [ForumType.Investor, 'investor'],
    [ForumType.BasicTrader, 'basic-trader'],
    [ForumType.AdvancedTrader, 'advanced-trader'],
    [ForumType.Institutional, 'institutional']
]);

export function ForumTypeToUrl(forumType: ForumType): string {
    return ForumTypeUrls.get(forumType);
}

export function getForumTypeFromRoute(routeData: Data): ForumType {
    return routeData['forumType'] as ForumType;
}

export function allForumTypes(): ForumType[] {
    return [
        ForumType.Investor,
        ForumType.BasicTrader,
        ForumType.AdvancedTrader,
        ForumType.Institutional
    ];
}
