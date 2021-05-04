import { PriceAlertCondition } from "./EnumsDTO";

export interface PriceAlertConditionObject {
    price: number;
    condition: PriceAlertCondition;
}