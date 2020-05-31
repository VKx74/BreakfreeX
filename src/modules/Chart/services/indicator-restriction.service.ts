import { Injectable } from "@angular/core";
import { IdentityService } from "../../../app/services/auth/identity.service";
import { TemplatesStorageService } from './templates-storage.service';
import { AlertService } from '@alert/services/alert.service';

@Injectable()
export class IndicatorRestrictionService {

    private _restrictedIndicators: string[] = [];
    private _indicatorSuffix: string = "_indicator";

    constructor(protected _identity: IdentityService) {
        const restrictedComponents = this._identity.restrictedComponents;

        for (const restrictions of restrictedComponents) {
            if (restrictions.endsWith(this._indicatorSuffix)) {
                this._restrictedIndicators.push(restrictions.replace(this._indicatorSuffix, ""));
            }
        }
    }

    public getRestrictions(): string[] {
        return this._restrictedIndicators;
    }
}