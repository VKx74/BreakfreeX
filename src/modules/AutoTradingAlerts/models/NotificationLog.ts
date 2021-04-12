import { AlertNotificationType, NotificationStatus } from "./EnumsDTO";


export interface NotificationLog {
    id: number;
    alertId: number;
    time: number;
    notificationMessage: string;
    notificationType: AlertNotificationType;
    notificationStatus: NotificationStatus;
}
