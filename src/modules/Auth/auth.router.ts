import {AuthRootComponent} from "./components/root/auth-root.component";
import {RouterModule} from "@angular/router";
import {ForgotPasswordPageComponent} from "./components/forgot-password-page/forgot-password-page.component";
import {NewPasswordPageComponent} from "./components/new-password-page/new-password-page.component";
import {NgModule} from "@angular/core";
import {AuthRoutes} from "./auth.routes";
import {CredentialsPageComponent} from "./components/credentials-page/credentials-page.component";
import {VerifyEmailPageComponent} from "./components/verify-email-page/verify-email-page.component";
import {AccountTypePageComponent} from "./components/account-type-page/account-type-page.component";
import {PersonalAccountRegisterPageComponent} from "./components/personal-account-register-page/personal-account-register-page.component";
import {BusinessAccountRegisterPageComponent} from "./components/business-account-register-page/business-account-register-page.component";
import {InstitutionalAccountRegisterPageComponent} from "./components/institutional-account-register-page/institutional-account-register-page.component";
import {ResetTwoStepAuthComponent} from "./components/reset-two-step-auth/reset-two-step-auth.component";
import {LoginPageComponent} from "./components/login-page/login-page.component";
import { LoginWithPageComponent } from './components/login-with-page/login-with-page.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: AuthRootComponent,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: AuthRoutes.Login
                    },
                    {
                        path: AuthRoutes.Login,
                        component: LoginPageComponent
                    },
                    {
                        path: AuthRoutes.RegistrationFinished,
                        component: LoginPageComponent
                    },
                    {
                        path: AuthRoutes.LoginWith,
                        component: LoginWithPageComponent
                    },
                    {
                        path: AuthRoutes.Registration,
                        component: CredentialsPageComponent,
                        data: {
                            test: "1"                            
                        }
                    },
                    {
                        path: AuthRoutes.Confirming,
                        component: VerifyEmailPageComponent
                    },
                    {
                        path: AuthRoutes.PersonalAccount,
                        component: PersonalAccountRegisterPageComponent
                    },
                    {
                        path: AuthRoutes.BusinessAccount,
                        component: BusinessAccountRegisterPageComponent
                    },
                    {
                        path: AuthRoutes.InstitutionalAccount,
                        component: InstitutionalAccountRegisterPageComponent
                    },
                    {
                        path: AuthRoutes.AccountType,
                        component: AccountTypePageComponent
                    },
                    {
                        path: AuthRoutes.ForgotPassword,
                        component: ForgotPasswordPageComponent
                    },
                    {
                        path: AuthRoutes.RestorePassword,
                        component: NewPasswordPageComponent
                    },
                    {
                        path: AuthRoutes.ResetTwoStepAuth,
                        component: ResetTwoStepAuthComponent
                    }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})

export class AuthRoutingModule {

}
