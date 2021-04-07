import { AlertExecutionStrategy, AlertType } from "./EnumsDTO";

export interface AlertHistory {
    Id: number;
    AlertId: number;
    Type: AlertType;
    ExecutionStrategy: AlertExecutionStrategy;
    Condition: any;
    Action: any;
    Name: string;
    Description: string;
    NotificationMessage: string;
    Created: number;
    TriggerTime: number;
}
