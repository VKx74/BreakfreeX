import { AlertExecutionStrategy, AlertType } from "./EnumsDTO";

export interface AlertHistoryDTO {
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
