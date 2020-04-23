import {FiltrationParams} from "@app/models/filtration-params";
import {IPaginationResponse} from "@app/models/pagination.model";

export interface IBaseTrade {
    id: number;
    createdAt: string;
    updatedAt: string;
}

export interface ITrade extends IBaseTrade {
    price: number;
    volume: number;
    askId: number;
    bidId: number;
    trend: number;
    marketId: string;
    askMemberId: number;
    bidMemberId: number;
    askMemberEmail: string;
    bidMemberEmail: string;
    funds: number;
}

export interface IMappedTrade extends ITrade {
    askMember?: any;
    bidMember?: any;
}

export interface ITradeRequestParams {
    memberId?: number;
    search?: string;
    orderField?: 'Date';
    descending?: boolean;
    startDate?: string;
    endDate?: string;
}

export interface ITradeReportsResolverData {
    trades: IPaginationResponse<IMappedTrade>;
}

export class TradeReportsFiltrationParams extends FiltrationParams<ITradeRequestParams> implements ITradeRequestParams {
    descending: boolean;
    endDate: string;
    memberId: number;
    orderField: "Date";
    search: string;
    startDate: string;

    toObject(): ITradeRequestParams {
        return {
            startDate: this.toJSON(this.startDate),
            endDate: this.toJSON(this.endDate),
            search: this.search,
            descending: this.descending,
            orderField: this.orderField,
            memberId: this.memberId,
        };
    }

    clearDateParams() {
        this.startDate = null;
        this.endDate = null;
    }
}



