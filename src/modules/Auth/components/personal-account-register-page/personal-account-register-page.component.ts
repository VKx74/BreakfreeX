import {Component} from '@angular/core';
import {catchError, first, switchMap} from "rxjs/operators";
import {PersonalInfoService, RegisterPersonalAccountDTOModel} from "@app/services/personal-info/personal-info.service";
import {AuthRoutes} from "../../auth.routes";
import {ActivatedRoute, Router} from "@angular/router";
import {AccountType, KycModel, KycPageConfig} from "../../models/models";
import {KycPageCompleteHandler} from "../kyc-page/kyc-page";
import {of, throwError} from "rxjs";

@Component({
    selector: 'personal-account-register-page',
    templateUrl: './personal-account-register-page.component.html',
    styleUrls: ['./personal-account-register-page.component.scss']
})
export class PersonalAccountRegisterPageComponent {
    personalAccountRegisterModel: RegisterPersonalAccountDTOModel;
    kycPageConfig: KycPageConfig;

    constructor(private _router: Router,
                private _route: ActivatedRoute,
                private _personalInfoService: PersonalInfoService) {
    }

    ngOnInit() {
        this._route.queryParams
            .pipe(first())
            .subscribe(params => {
                if (params['email']) {
                    this.personalAccountRegisterModel = new RegisterPersonalAccountDTOModel({email: params['email']});
                    this.kycPageConfig = {
                        type: AccountType.Personal,
                        data: null
                    };
                }
            });
    }

    kycPageCompleteHandler: KycPageCompleteHandler = (kycModel: KycModel) => {
        this.personalAccountRegisterModel.information = kycModel.information;
        this.personalAccountRegisterModel.documents = kycModel.documents;

        return this._personalInfoService.sendPersonalInfo(this.personalAccountRegisterModel)
            .pipe(
                switchMap(() => {
                    return of(this._router.navigate([AuthRoutes.Login], {
                        relativeTo: this._route.parent,
                        queryParams: {infoFilled: true}
                    }));
                }),
                catchError((error) => {
                    return throwError('Failed: ' + (error.error || error));
                })
            );
    }

}
