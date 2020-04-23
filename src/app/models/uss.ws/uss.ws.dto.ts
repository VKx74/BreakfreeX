export interface UssWsRequestDto {
    Subscribe: boolean;
    Body: any;
    Headers: any;
    Action: string;
    Id: string;
}

export interface UssWsResponseDto {
    Body: any;
    Headers: any;
    Action: string;
    Id: string;
}
