export interface BacktestStartRequestDTO {
    Script: {
        Id: string;
        Name: string;
        Code: string;
    };
    HistoryId: string;
}

export interface BacktestStopRequestDTO {
    Id: string;
}

export interface BacktestStartResponsetDTO {
    Id: string;
}

export interface BacktestStopResponsetDTO {
    Id: string;
}
