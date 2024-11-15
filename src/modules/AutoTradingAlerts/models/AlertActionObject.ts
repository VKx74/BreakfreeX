import { AlertNotificationType } from "./EnumsDTO";

export interface AlertActionObject {
    notifications: AlertNotificationType[];
    playSound: boolean;
    sound: string;
}
