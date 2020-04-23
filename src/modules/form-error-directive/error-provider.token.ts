import {InjectionToken} from "@angular/core";
import {IFormErrorProvider} from "./error.provider";

export const ErrorProviderToken = new InjectionToken<IFormErrorProvider>('Error Provider');
