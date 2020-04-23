import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {AppConfigService} from "@app/services/app.config.service";
import {map} from "rxjs/operators";
import {IdentityService} from "@app/services/auth/identity.service";
import {Injectable} from "@angular/core";

export enum IdentityUserActivityAction {
  LogIn = -1,
  SignOut,
  CreateAPIKey,
  DeleteAPIKey,
  PhoneNumberAdd,
  PhoneNumberChange,
  PhoneNumberDeleteByUser,
  PhoneNumberDeleteBySupport,
  PasswordChange,
  PasswordForgot,
  PasswordRestore,
  PasswordChangeBySupport,
  TwoFAEnable,
  TwoFADisable,
  TwoFASupportDisable,
  TwoFAConfirm,
  TwoFARestore,
  UserUpdate,
  UserActivate,
  UserDeactivate,
  UserRestorePassword,
  UserTagsChange
}

export enum ActionStatus {
  Undefined,
  Failed,
  Success
}

export interface IdentityActivityLogInfo {
  action: IdentityUserActivityAction;
  time: number;
  ip: string;
  city: string;
  country: string;
  status: ActionStatus;
}


interface LoginLogInfoDTO {
  ip: string;
  city: string;
  country: string;
  status: ActionStatus;
  time: number;
}

interface IActivityLogInfoDTO {
  ip: string;
  city: string;
  country: string;
  status: ActionStatus;
  action: IdentityUserActivityAction;
  time: number;
}

@Injectable()
export class IdentityLogsService {
  constructor(private _http: HttpClient,
              private _identityService: IdentityService) {
  }

  getLoginLogs(userId?: string): Observable<IdentityActivityLogInfo[]> {
    const getCurrentUserLogs = !userId || (userId === this._identityService.id);
    const obs = getCurrentUserLogs
        ? this._http.get<LoginLogInfoDTO[]>(`${AppConfigService.config.apiUrls.identityUrl}logs/my/login`, {withCredentials: true})
        : this._http.get<LoginLogInfoDTO[]>(`${AppConfigService.config.apiUrls.identityUrl}logs/user/login/${userId}`, {withCredentials: true});

    return obs
        .pipe(
            map((dtos: LoginLogInfoDTO[]) => {
              return dtos.map((dto) => {
                return {
                  action: IdentityUserActivityAction.LogIn,
                  time: dto.time,
                  ip: dto.ip,
                  city: dto.city,
                  country: dto.country,
                  status: dto.status
                };
              });
            })
        );
  }

  getActivityLogs(userId?: string): Observable<IdentityActivityLogInfo[]> {
    const getCurrentUserLogs = !userId || (userId === this._identityService.id);
    const obs = getCurrentUserLogs
        ? this._http.get<LoginLogInfoDTO[]>(`${AppConfigService.config.apiUrls.identityUrl}logs/my/activity`, {withCredentials: true})
        : this._http.get<LoginLogInfoDTO[]>(`${AppConfigService.config.apiUrls.identityUrl}logs/user/activity/${userId}`, {withCredentials: true});

    return obs
        .pipe(
            map((dtos: IActivityLogInfoDTO[]) => {
              return dtos.map((dto) => {
                return {
                  action: dto.action,
                  time: dto.time,
                  ip: dto.ip,
                  city: dto.city,
                  country: dto.country,
                  status: dto.status
                };
              });
            })
        );
  }

}
