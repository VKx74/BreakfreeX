export enum EUploadHistoryDateFormat {
    DateTime = 0,
    Miliseconds = 1,
    UnixSeconds = 2
}

export enum EUploadHistoryNameProperty {
    Open = 0,
    High = 1,
    Low = 2,
    Close = 3,
    Volume = 4,
    Date = 5,
    Time = 6
}

export interface UploadHistoryTypeBarProperty {
    Name: EUploadHistoryNameProperty;
    Position: number;
}

export interface UploadHistoryStorageRequestDTO {
    UserId: string;
    Name: string;
    Description: string;
    Instrument: {
        Name: string;
        Exchange: string;
    };
    Separator: string;
    DateFormatString?: string;
    Value: string;
    DateFormat: EUploadHistoryDateFormat;
    Mapping: UploadHistoryTypeBarProperty[];
}


export interface DeleteHistoryStorageRequestDTO {
    StorageId: string;
    UserId: string;
}

export interface HistoryStorageDTO {
    id: string;
    name: string;
    description: string;
    instrument: {
        name: string;
        exchange: string;
    };
    periodicity: number;
    interval: number;
    fromDate: number;
    toDate: number;
    barsCount: number;
    created: number;
    source: string;
    index: number;
}

export interface HistoryStorageBar {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    timeStamp: number;
}

export interface HistoryStorageDataDTO {
    page: number;
    totalPages: number;
    data: HistoryStorageBar[];
}

// example of UploadHistoryRequestDTO
// {
//     "UserId": "b8405036-0e4a-4eb3-81a6-31c158ef1339",
//     "Name": "applhistory",
//     "Description": " ",
//     "Instrument": {
//         "Name": "AAPL",
//         "Exchange": "Stock"
//     },
//     "Separator": ",",
//     "DateFormat": "0",
//     "DateFormatString": "dd-MM-yy",
//     "Mapping": [
//     {
//         "Name": "0",
//         "Position": "1"
//     },
//     {
//         "Name": "1",
//         "Position": "2"
//     },
//     {
//         "Name": "2",
//         "Position": "3"
//     },
//     {
//         "Name": "3",
//         "Position": "4"
//     },
//     {
//         "Name": "4",
//         "Position": "5"
//     },
//     {
//         "Name": "5",
//         "Position": "0"
//     }
//
//     ],
//     "Value": '...'
// };

