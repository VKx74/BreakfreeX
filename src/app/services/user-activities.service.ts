import {Injectable} from "@angular/core";
import {Observable, of} from "rxjs";
import {delay} from "rxjs/operators";

export enum UserActivityAction {
    LoggedIn,
    LoginFailed
}

export interface IUserActivityInfo {
    action: UserActivityAction;
    time: number;
    ip: string;
    ipRegion: string;
}

@Injectable()
export class UserActivitiesService {
    getActivitiesInfo(userId: string): Observable<IUserActivityInfo[]> {
        return of(this._getActivities(50)).pipe(delay(2000));
    }

    private _getActivities(count: number): IUserActivityInfo[] {
        const result = [];

        for (let i = 0; i < count; i++) {
            result.push({
                action: i % 2 === 0 ? UserActivityAction.LoggedIn : UserActivityAction.LoginFailed,
                time: new Date().getTime(),
                ip: '192.168.01.01',
                ipRegion: i % 2 === 0 ? 'Ukraine Ternopil\'' : 'Australia Sidney'
            });
        }

        return result;
    }
}
