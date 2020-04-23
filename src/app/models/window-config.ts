import {Theme} from "../enums/Theme";

export interface ISharedServices {
    auth: any;
    theme: any;
}

export interface IWindowConfig {
    isSubWindow: boolean;
    theme: Theme;
    services: ISharedServices;
    component: any;
}
