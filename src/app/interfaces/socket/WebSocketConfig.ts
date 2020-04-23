export interface IWebSocketConfig {
    url: string;
    providers?: any;
}

export interface IWebSocketReconnectConfig {
    initialTimeout: number;
    maxTimeout: number;
    reconnectIfNotNormalClose: boolean;
}

export const ReadyStateConstants = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
    RECONNECT_ABORTED: 4
};
