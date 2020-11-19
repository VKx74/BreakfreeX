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

        if (!this._identity.isAuthorizedCustomer) {
            this._restrictedIndicators.push("RTD");
        }
    }

    public getRestrictions(): string[] {
        return this._restrictedIndicators;
    } 
    
    public canRunStrategyReplay(): boolean {
        return this.isAdmin();
    }
    
    public canRunXModeReplay(): boolean {
        return true;
    }

    public validate(name: string): boolean {
        for (const restriction of this._restrictedIndicators) {
            if (restriction.toUpperCase() === name.toUpperCase()) {
                return false;
            }
        }
        
        return true;
    }

    private isAdmin() {
        return this._identity.isAdmin;
    }
}
