import {IBrokerUserInfo, OrderSide, OrderTypes, IPlaceOrderAction, ICancelOrderAction} from "../models";
import {IWSResponseBase} from "@app/models/coinbase.exchange/models";

export enum ECryptoOperation {
    Withdraw = 'Withdraw',
}

export enum EOrderStatus {
    Open = 'Open',
    Filled = 'Filled',
    Canceled = 'Canceled',
}

export enum ETransactionType {
    RealisedPNL = 'RealisedPNL',
    UnrealisedPNL = 'UnrealisedPNL',
    Deposit = 'Deposit',
    Withdrawal = 'Withdrawal',
    Transfer = 'Transfer',
    Total = 'Total',
}

export enum ETransactionState {
    Completed = 'Completed',
    Confirmed = 'Confirmed',
    Pending = 'Pending',
    Processing = 'Processing',
    Collected = 'Collected',
    Rejected = 'Rejected',
    Canceled = 'Canceled'
}

export enum EActionDataType {
    Order = 'Order',
    Execution = 'Execution',
    Transact = 'Transact',
    Wallet = 'Wallet'
}

export enum EActionType {
    Add = 'Add',
    Update = 'Update',
    Delete = 'Delete',
}

export interface IWallet {
    currency: string;
    address: string;
    balance: number;
    locked: number;
}

export interface IWalletTransaction {
    id: string;
    address: string;
    currency: string;
    amount: number;
    fee: number;
    transactID: string;
    confirmations?: number;
    created_at?: number;
    completed_at?: number;
    state: ETransactionState;
    transactType: ETransactionType;
}

export interface ICryptoUserInfo extends IBrokerUserInfo {

}

export interface ICryptoOrder {
    id: string;
    symbol: string;
    size: number;
    remainedSize?: number;
    price: number;
    stopPrice: number;
    avgPrice?: number;
    marketPrice?: number;
    side: OrderSide;
    type: string;
    status: EOrderStatus;
    time: number;
}

export interface ICryptoTrade {
    id: string;
    orderID: string;
    symbol: string;
    size: number;
    filledSize: number;
    remainedSize: number;
    price: number;
    avgPrice: number;
    side: OrderSide;
    type: string;
    time: number;
}

export interface ICryptoLoadTradesAction {
    symbol?: string;
}

export interface ICryptoPlaceOrderAction extends IPlaceOrderAction {
    price?: number; // Limit price
    stopPrice?: number; // Stop price
}

export interface ICryptoCancelOrderAction extends ICancelOrderAction {
}

export interface ICryptoLoadOrdersAction {
    symbol?: string;
    status?: EOrderStatus;
    amount?: number;
}

export interface ICryptoWithdrawAction {
    From: string;
    Currency: string;
    Amount: number;
    To: string;
    Fee?: number;
    Pin?: string;
}

export interface ICryptoActionUpdate extends IWSResponseBase {
    DataType: EActionDataType;
    UpdateAction: EActionType;
    Channel: string;
    Data: any[];
}

export interface ICryptoCancelWithdrawAction {
    Id: string;
}
