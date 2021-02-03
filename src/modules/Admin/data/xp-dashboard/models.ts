export interface XPDashboardItemDTO {
    userId: string;
    levelName: string;
    level: number;
    levelPoints: number;
    points: number;
}

export interface XPDashboardItem {
    profile: XPDashboardItemDTO;
    email: string;
}