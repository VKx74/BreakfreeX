export interface IOkexLoginAction {
    ApiKey: string;
    Secret: string;
    PassPhrase: string;
}

export interface IOkexRefreshAction {
    RefreshToken: string;
}