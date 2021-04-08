import { AlertNotificationType } from "./EnumsDTO";


export interface NotificationLogDTO {
    id: number;
    alertId: number;
    time: number;
    notificationMessage: string;
    notificationType: AlertNotificationType;
}


