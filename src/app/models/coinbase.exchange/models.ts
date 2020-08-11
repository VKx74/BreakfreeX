
import {ESide} from "../common/side";

export enum EUpdateAction {
    Delete = 'Delete',
    Update = 'Update',
    Add = 'Add'
}

export interface IWSRequestMessageBody {
    MsgType: string;
    Channel: string;
    Id: string;
}

export interface IWSSubscriptionBody {
    MsgType: string;
    Channel: string;
    AccessToken?: string;
    Product?: string;
    Market?: string;
    IsSubscribe: boolean;
    Id?: string;
    BrokerKey?: string;
    AuthorizeToken?: string;
    OandaBrokerKey?: string;
}

export interface IWSResponseBase {
    MsgType: string;
}

export interface ITickerResponse extends IWSResponseBase {
    Product: string;
    Market: string;
    Price: number;
    Size: number;
    Side: ESide;
    Date: number;
}

export interface IRazeTickerResponse extends IWSResponseBase {
    Symbol: string;
    Price: number;
    Size: number;
    Side: number;
    Time: number;
    Id?: number;
    OrderId?: number;
    MatchOrderId?: number;
    UserId?: string;
    MatchUserId?: string;
}

export interface ILevel2UpdateAction {
    UpdateAction: EUpdateAction;
    OrderSide: ESide;
    Price: number;
    Size: number;
    Position: number;
}

export interface ILevel2SnapshotItem {
    Price: number;
    TotalSize: number;
}

export interface ILevel2SnapshotData {
    Bids: ILevel2SnapshotItem[];
    Asks: ILevel2SnapshotItem[];
}

export interface ILevel2Response extends IWSResponseBase {
    Product: string;
    Market: string;
    Updates: ILevel2UpdateAction[];
}

export interface ILevel2Snapshot extends IWSResponseBase {
    Symbol: string;
    Market: string;
    Data: ILevel2SnapshotData;
}

