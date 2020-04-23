import {IHistoryRequest} from "./historyRequest";
import {IBarData} from "./barData";

export interface IHistoryResponse {
    request: IHistoryRequest;
    data: IBarData[];
}
