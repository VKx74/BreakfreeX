import { IPlaceOrderAction, ICancelOrderAction } from '../models';

export interface IForexPlaceOrderAction extends IPlaceOrderAction {
    price?: number;
}

export interface IForexCancelOrderAction extends ICancelOrderAction {
}
