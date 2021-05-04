import { AlertExecutionStrategy, AlertType } from "./EnumsDTO";

export interface AlertHistoryDTO {
    id: number;
    alertId: number;
    type: AlertType;
    executionStrategy: AlertExecutionStrategy;
    condition: any;
    action: any;
    name: string;
    description: string;
    notificationMessage: string;
    created: number;
    triggerTime: number;
}
