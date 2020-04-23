import {HttpParams} from "@angular/common/http";
import {IThread, IThreadBan} from "../../Chat/models/thread";
import {AdminRoutes} from "../admin.routes";
import {ComponentIdentifier} from "@app/models/app-config";
import {IBaseUserModel} from "@app/models/auth/auth.models";

export interface IPaginatedDataLoadingResult<T> {
    itemsCount: number;
    pageIndex: number;
    pageSize: number;
    items: T[];
}

export class QueryParamsConstructor {
    static FORBIDDEN_VALUES = [null, undefined, -1, '', ' '];

    static fromObject(obj: object): HttpParams {
        if (!obj) return new HttpParams();
        if (obj instanceof HttpParams) return obj;

        return Object.keys(obj)
            .filter(key => key && !QueryParamsConstructor.FORBIDDEN_VALUES.includes(obj[key]))
            .reduce((acc, curr) => {

                    const value = obj[curr];
                    if (value instanceof Array) {
                        (value as any[]).forEach(item => item ? acc = acc.append(curr, item.toString()) : null);
                        return acc;
                    } else if (value instanceof Object) {
                        // TODO: Test
                        return acc.append(curr, QueryParamsConstructor.fromObject(value).toString());
                    } else {
                        return acc.append(curr, value);
                    }
                }, new HttpParams()
            );
    }

    static fromObjects(...objs: object[]) {
        const merged = objs.reduce((acc, curr) => Object.assign(acc, curr), {});
        return QueryParamsConstructor.fromObject(merged);
    }

    static fromArray(key: string, arr: any[]) {
        if (arr instanceof Array) {
            return arr.reduce((acc: HttpParams, curr) => {
                return acc.append(key, curr);
            }, new HttpParams());
        }
    }
}

export interface ThreadResolverData<T> {
    thread: IThread;
    data: T;
    bans?: IThreadBan[];
}

export interface IExchangeAccount extends IBaseUserModel {
    id: number;
    memberId: number;
    currencyId: string;
    balance: number;
    locked: number;
    createdAt: string;
    updatedAt: string;
}

export interface IExchangeAccountFiltrationParams {
    memberIds: number[];
    search: string;
    currency: string;
    accountsSortFields: string;
    descending: string;
}

export interface IExportEchangeDataFiltrationParams {
    count?: number;
    from?: string;
    to?: string;
}

// export class
