import {PersonalInfoStatus} from "../../services/personal-info/personal-info.service";

export class SignInRequestModel {

    public email: string;

    public password: string;

    public pin?: string;

    public rememberMe: boolean;
}

export class SignInWithThirdPartyRequestModel {

    public authCode: string;

    public authProvider: string;
}

export class GrantTokenResponse {
    accessToken: string;
    refreshToken?: string;
    expireIn: string;
    isUserCreated?: boolean;
}

export class RefreshTokenRequestModel {

    public refreshToken: string;
}

export class ChangePasswordModel {

    public currentPassword: string;

    public newPassword: string;
}

export class ResetPasswordBySupportModel {

    public email: string;

    public newPassword: string;
}

export class RestorePasswordModel {

    public email: string;

    public password: string;

    public token: string;
}

export class ForgotPasswordModel {

    public email: string;

    public redirectUrl: string;
}

export class Subscription {
    id: string;
    status: string;
    product: string;
    name: string;
    amount: number;
    currency: string;
    created: number;
    interval: string;
    intervalCount: number;
}

export class UserModel {

    public email: string;

    public stripeId: string;

    public phone: string;

    public phoneConfirmed: string;

    public emailConfirmed: boolean;

    public id: string;

    public userName: string;

    public isActive: boolean;

    public password: string;

    public role: string;

    public kycStatus: PersonalInfoStatus;

    public twoFactorEnabled?: boolean;

    public tags: string[] = [];

    public subscriptions: Subscription[] = [];
}

export class UserProfileModel {
    public id: string;
    public firstName: string;
    public lastName: string;
    public role: string;
    public userName: string;
    public avatarId: string;
    public useUserName: boolean;
}

export class RegisterUserModel {

    public email: string;

    public password: string;

    public role: string;

    public redirectUri: string;
}

export class ReconfirmEmailModel {

    public email: string;

    public redirectUri: string;
}

export class UpdateUserModel {

    public email: string;
    
    public stripeId: string;

    public phoneNumber: string;

    public userName: string;

    public id: string;

    public role: string;
}

export class Enable2FactorAuthRequest {
    public email: string;
}

export class Enable2FactorAuthResponse {
    qrCodeUrl: string;
}

export class Disable2FactorAuthRequest {
    public email: string;

    public pin: string;
}

export class ConfirmEnable2FactorAuthRequest {
    public email: string;

    public pin: string;
}

export class Confirm2FactorAuthRequest {
    public email: string;

    public pin: string;
}

export class Confirm2FactorAuthResponse {
}

export class Restore2FactorAuthRequest {
    public email: string;

    public redirectUrl: string;
}

export enum Roles {
    User = 'Personal_Account',
    KYCOfficer = 'KYC_Officer',
    Admin = 'Admin',
    SocialMediaOfficer = 'Social_Media_Officer',
    SystemMonitoringOfficer = 'System_Monitoring_Officer',
    FreeUser = 'Free_User',
    TreasureOfficer = 'Treasury_Officer',
    BusinessAccount = 'Business_Account',
    InstitutionalAccount = 'Institutional_Account',
    SecurityOfficer = 'Security_Officer',
    MarketOfficer = 'Market_Officer',
    NewsOfficer = 'News_Officer',
    SupportOfficer = 'Support_Officer',
}

export interface UserRole {
    id: string;
    name: Roles;
}

export enum EDocumentType {
    None = 0,
    MedicalCard = 1,
    BirthCertificate = 2,
    IdentityCard = 3,
    DriversLicense = 4,
    Passport = 5
}


export enum EAuthErrorStatus {
    UserNotFound = 1000,
    InvalidPin = 1001,
    InvalidPassword = 1002,
    UserDeactivated = 1003,
    EmailNotConfirmed = 1004,
    KycNotSent = 1005,
    KycPending = 1006,
    KycRejected = 1007,
    KycNone = 1008,
    KycApproved = 1009,
    EmailInUse = 1010,
    UserManagerInternalError = 1011,
    ConfirmationLetterSent = 1012,
    EmailConfirmed = 1013,
    CanNotDeleteDocuments = 1014,
    CanNotUpdateUserAfterDocumentDetached = 1015,
    CanNotUpdateUserInfo = 1016,
    BusinessTypeNotValid = 1017,
    NumberOfEmployersNotValid = 1018,
    CompanyFundsNotValid = 1019,
    AnticipatedCryptoFundsNotValid = 1020,
    AnticipatedAverageCryptoFundsNotValid = 1021,
    StrategyMixNotValid = 1022,
    CanNotSendSms = 1022,
    InvalidCode = 1023,
    CanNotSetPhoneNumber = 1024,
}

export interface IBaseUserModel {
    id: any;
    userName: string;
}

export interface IIdentityToken {
    sub: string;
    exp: number;
    role: string;
    email: string;
    first_name: string;
    preferred_username: string;
    last_name: string;
    phone_number: string;
    is_two_factor_auth_enable: boolean;
    user_tag: string;
    user_subs: string;
    restricted: string[];
}


