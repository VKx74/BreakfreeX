import {Observable} from "rxjs";
import {IdentityActivityLogInfo} from "@app/services/identity-logs.service";

export interface IActivityResolver {
    activities: any;
}


export type IActivityResolverData = {
    [key in keyof IActivityResolver]: Observable<IdentityActivityLogInfo[]>;
};
