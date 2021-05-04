import { AlertExecutionStrategy, AlertType } from "./EnumsDTO";

export interface AlertHistory {
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


