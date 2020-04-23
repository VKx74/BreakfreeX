import {IBaseUserModel} from "@app/models/auth/auth.models";
import {FiltrationParams} from "@app/models/filtration-params";

export interface IBaseExchangeMember {
    level: number;
    sn: string;
    disabled: boolean;
    email: string;
}

export interface IExchangeMember extends IBaseUserModel {
    id: number;
    createdAt: string;
    updatedAt: string;
}

export interface IExhcangeMembersFiltrationParams {
    email?: string;
}

export class ExchangeMembersFiltrationParams extends FiltrationParams<IExhcangeMembersFiltrationParams> {
    email: string;

    constructor() {
        super();
    }

    toObject(): IExhcangeMembersFiltrationParams {
        return {
            email: this.email
        };
    }
}
