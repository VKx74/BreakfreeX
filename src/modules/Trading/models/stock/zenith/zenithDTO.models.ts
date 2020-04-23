export interface IZenithLoginRequestDTO {
    Username: string;
    Password: string;
}

export interface IZenithRefreshTokenRequestDTO {
    AccessToken: string;
    RefreshToken: string;
}

export interface IZenithLoginResponseDTO {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    refreshToken: string;
    scope: string;
}

export interface IZenithPlaceOrderBaseRequestDTO {
    Exchange: string;
    Code: string;
    Side: string;
    Style: string;
    Market: string;
}

export interface IZenithPlaceEquityOrderRequestDTO extends IZenithPlaceOrderBaseRequestDTO {
    Type: string;
    Quantity: number;
    Validity: string;
    LimitPrice?: number;
}

export interface IZenithPlaceManagedFoundsOrderRequestDTO extends IZenithPlaceOrderBaseRequestDTO {
    UnitType: string;
    UnitAmount: number;
    Currency?: string;
}

export interface IZenithPlaceOrderResponseDTO {
    result: string;
    errors: string[];
    order: any;
    estimatedBrokerage: number;
    estimatedTax: number;
    estimatedValue: number;
}

export interface IZenithCancelOrderResponseDTO {
    result: string;
    errors: string[];
    order: any;
}