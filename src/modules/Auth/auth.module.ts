import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {KycPageComponent} from "./components/kyc-page/kyc-page";
import {LoginPageComponent} from "./components/login-page/login-page.component";
import {ForgotPasswordPageComponent} from "./components/forgot-password-page/forgot-password-page.component";
import {NewPasswordPageComponent} from "./components/new-password-page/new-password-page.component";
import {UIModule} from "UI";
import {AuthRootComponent} from "./components/root/auth-root.component";
import {AuthRoutingModule} from "./auth.router";
import {CredentialsPageComponent} from "./components/credentials-page/credentials-page.component";
import {VerifyEmailPageComponent} from "./components/verify-email-page/verify-email-page.component";
import {PersonalInfoComponent} from "./components/personal-info/personal-info.component";
import {KycDocumentsComponent} from "./components/kyc-documents/kyc-documents.component";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatStepperModule} from "@angular/material/stepper";
import {PersonalInfoService} from "@app/services/personal-info/personal-info.service";
import {AccountTypePageComponent} from "./components/account-type-page/account-type-page.component";
import {PersonalAccountRegisterPageComponent} from "./components/personal-account-register-page/personal-account-register-page.component";
import {BusinessAccountRegisterPageComponent} from "./components/business-account-register-page/business-account-register-page.component";
import {CompanyInfoComponent} from "./components/company-info/company-info.component";
import {InstitutionalAccountRegisterPageComponent} from "./components/institutional-account-register-page/institutional-account-register-page.component";
import {MatRadioModule} from "@angular/material/radio";
import {NgxCaptchaModule} from "ngx-captcha";
import {OnEnterDirectiveModule} from "@on-enter/on-enter-directive.module";
import {ResetTwoStepAuthComponent} from './components/reset-two-step-auth/reset-two-step-auth.component';
import {SharedModule} from "Shared";
import {TranslateModule} from "@ngx-translate/core";
import {LocalizationModule} from "Localization";
import {ErrorProviderToken} from "@form-error-directive/error-provider.token";
import {FormErrorProviderFactory} from "@app/helpers/form-error-provider.factory";
import {SharedTranslateService} from "@app/localization/shared.token";

@NgModule({
    declarations: [
        AuthRootComponent,
        KycPageComponent,
        ForgotPasswordPageComponent,
        NewPasswordPageComponent,
        CredentialsPageComponent,
        VerifyEmailPageComponent,
        PersonalInfoComponent,
        AccountTypePageComponent,
        PersonalAccountRegisterPageComponent,
        BusinessAccountRegisterPageComponent,
        InstitutionalAccountRegisterPageComponent,
        CompanyInfoComponent,
        KycDocumentsComponent,
        ResetTwoStepAuthComponent,
        LoginPageComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AuthRoutingModule,
        UIModule,
        NgxCaptchaModule,
        SharedModule,

        MatRadioModule,
        MatStepperModule,
        MatInputModule,
        MatDatepickerModule,
        MatSelectModule,
        OnEnterDirectiveModule,
        TranslateModule.forRoot(),
        LocalizationModule.forRoot()
    ],
    providers: [
        PersonalInfoService,
        {
            provide: ErrorProviderToken,
            useFactory: FormErrorProviderFactory,
            deps: [SharedTranslateService]
        },
    ],
    entryComponents: []
})
export class AuthModule {
}
