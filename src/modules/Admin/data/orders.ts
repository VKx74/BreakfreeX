import {MarketDTO} from "@app/models/exchange/models";
import {UserModel, UserProfileModel} from "@app/models/auth/auth.models";
import {DateRangeParams, FiltrationParams} from "@app/models/filtration-params";
import {IPaginationResponse} from "@app/models/pagination.model";

export interface IBaseOrder {
    bid: string;
    ask: string;
    marketId: string;
    price: number;
    volume: number;
    originValume: number;
    fee: number;
    state: number;
    type: string;
    memberId: number;
    email: string;
    ordType: string;
    locked: number;
    originLocked: number;
    fundsReceived: number;
    tradesCount: number;
}

export interface IOrder extends IBaseOrder {
    id: number;
    createdAt: string;
    updatedAt: string;
}

export interface IMappedOrder extends IOrder {
    market?: MarketDTO;
    member: UserProfileModel;
}

export interface IOrdersFiltrationParams {
    memberId?: number;
    currencyId?: string;
    search?: string;
    orderType?: string;
    side?: string;
    orderField?: string;
    descending?: boolean;
    startDate?: string;
    endDate?: string;
    marketId?: string;
}

export interface OrdersResolvedData {
    orders: IPaginationResponse<IOrder>;
}

export class OrdersFiltrationParams extends FiltrationParams<IOrdersFiltrationParams> implements IOrdersFiltrationParams {
    // private dateRangeParams = new DateRangeParams<string>();
    currencyId: string;
    descending: boolean;
    memberId: number;
    orderField: string;
    orderType: string;
    search: string;
    side: string;
    marketId: string;
    endDate: string;
    startDate: string;

    // get endDate(): string {
    //     const to = this.dateRangeParams.to;
    //     return to ? to.toString() : '';
    // }
    //
    // set endDate(value) {
    //     this.dateRangeParams.to = value;
    // }
    //
    // get startDate(): string {
    //     const from = this.dateRangeParams.from;
    //     return from ? this.dateRangeParams.from.toString() : '';
    // }
    //
    // set startDate(value: string) {
    //     this.dateRangeParams.from = value;
    // }

    constructor() {
        super();
    }

    clearDateRangeParams() {
        this.startDate = null;
        this.endDate = null;
    }

    toObject(): IOrdersFiltrationParams {
        return {
            marketId: this.marketId,
            search: this.search,
            descending: this.descending,
            startDate: this.toUTCSecondsString(this.startDate),
            endDate: this.toUTCSecondsString(this.endDate),
            // startDate: this.toJSON(this.startDate),
            // endDate: this.toJSON(this.endDate),
        };
    }
}

