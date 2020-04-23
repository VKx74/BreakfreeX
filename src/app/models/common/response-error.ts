export class ResponseError<T = any> {
    errorCode: number;
    errorDescription?: string;
    info?: T;
}