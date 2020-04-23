export class SystemNotification {
    id?: string;
    startDate: number;
    endDate: number;
    updateDate: number;
    title: string;
    description: string;
    userTags: string[] = [];
}

export class SystemNotificationsResponseModel {
    notifications: SystemNotification[];
    lastUpdate: number;
    count: number;
}

export class CheckIsNewSystemNotificationsModel {
    haveNewNotifications: boolean;
}

export interface GetNotificationsParams {
    search?: string;
    startDate?: string | number;
    endDate?: string | number;
    skip?: number;
    limit?: number;
}
