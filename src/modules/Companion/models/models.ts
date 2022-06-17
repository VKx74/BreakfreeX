export interface IAddUserWalletRequest {
    address: string;
}

export interface IAddDepositRequest {
    address: string;
    tx: string;
    amount: number;
    token: string;
}

export interface IAddWithdrawRequest {
    address: string;
    amount: number;
    token: string;
}

export interface IEditDepositRequest {
    address: string;
    id: number;
    processed: boolean;
}

export interface IEditWithdrawRequest {
    address: string;
    tx: string;
    id: number;
    processed: boolean;
}

export interface IUserWalletResponse {
    address: string;
    date: string;
    endDateDeposits: IEndDateDepositResponse[];
    closeDepositsRequests: ICloseDepositResponse[];
    flexibleDeposits: IDepositResponse[];
    withdraws: IWithdrawResponse[];
}

export interface IEndDateDepositResponse {
    id: number;
    userWalletAddress: string;
    date: string;
    endDate: string;
    tx: string;
    processed: boolean;
    completed: boolean;
    amount: number;
    returnPercentage: number;
    token: string;
    closeRequest?: ICloseDepositResponse;
}

export interface ICloseDepositResponse {
    id: number;
    userWalletAddress: string;
    date: string;
    processed: boolean;
}

export interface IDepositResponse {
    id: number;
    userWalletAddress: string;
    date: string;
    tx: string;
    processed: boolean;
    amount: number;
    token: string;
}

export interface IWithdrawResponse {
    id: number;
    userWalletAddress: string;
    date: string;
    tx: string;
    processed: boolean;
    amount: number;
    token: string;
}

export interface ISplScannerBalance {
    amount: string;
    decimals: number;
}

export interface ISplScannerItem {
    address: string;
    balance: ISplScannerBalance;
    blockTime: number;
    slot: number;
    changeAmount: number;
    changeType: string;
    decimals: number;
    fee: number;
    postBalance: any;
    preBalance: any;
    symbol: string;
    tokenAddress: string;
    owner: string;
}

export interface ISolScannerItem {
    src: string;
    dst: string;
    txHash: string;
    lamport: number;
    fee: number;
    blockTime: number;
    slot: number;
    status: string;
    decimals: number;
}

export interface ITokenTransactionDetails {
    from: ISplScannerItem;
    to: ISplScannerItem;
}

export interface ISolTransactionDetails {
    details: ISolScannerItem;
}

export interface IEditDepositRequest {
    address: string;
    id: number;
    processed: boolean;
}

export interface IEditWithdrawRequest {
    address: string;
    tx: string;
    id: number;
    processed: boolean;
}

export interface IAccountInfoResponse {
    flexibleDeposit: { [id: string]: IUserTokenEarningBalance };
    endDateDeposit: IEndDateDepositResponse[];
}

export interface IUserTokenEarningBalance {
    balances: IBalancesChangeItem[];
    returns: IReturnChangeItem[];
    amount: number;
}

export interface IBalancesChangeItem {
    amount: number;
    changeAmount: number;
    time: number;
    tx: string;
}

export interface IReturnChangeItem {
    amount: number;
    total: number;
    time: number;
}