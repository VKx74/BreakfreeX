import {InjectionToken} from "@angular/core";
import {BehaviorSubject} from "rxjs";

export const IDEConfigToken = new InjectionToken('IDEConfig');

export interface IDEConfig {
    theme$: BehaviorSubject<string>;
}