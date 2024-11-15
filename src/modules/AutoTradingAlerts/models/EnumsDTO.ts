export enum PriceAlertCondition {
    Greater,
    Less
}

export enum AlertType {
    PriceAlert,
    SonarAlert
}

export enum AlertStatus {
    Running,
    Stopped
}

export enum AlertNotificationType {
    Push,
    Email,
    SMS
}

export enum NotificationStatus {
    Sent,
    Failed,
    OutOfLImit
}

export enum AlertExecutionStrategy 
{
    Once,
    EveryTime
}