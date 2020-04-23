import {InjectionToken} from "@angular/core";

export enum ProfileActivitiesModuleMode {
    Platform,
    AdminArea,
    UserSettings,
}


export const ProfileActivitiesModuleModeToken = new InjectionToken<ProfileActivitiesModuleMode>('ProfileActivitiesModuleMode');
