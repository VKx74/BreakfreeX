import { NumberColorSetType } from "modules/Shared/directives/number-color.directive";

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

export interface IEditEndDateDepositRequest {
    address: string;
    id: number;
    processed: boolean;
    completed: boolean;
    tx: string;
    withdrawTxId: string;
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
    lastActivityDate: string;
    rate: number;
    ticket: string;
    endDateDeposits: IEndDateDepositResponse[];
    flexibleDeposits: IDepositResponse[];
    withdraws: IWithdrawResponse[];
}

export interface IEndDateDepositResponse {
    id: number;
    userWalletAddress: string;
    date: string;
    endDate: string;
    tx: string;
    withdrawTxId: string;
    processed: boolean;
    completed: boolean;
    amount: number;
    depositTerm: number;
    returnPercentage: number;
    token: string;
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

export interface IRedeemResponse {
    id: number;
    email: string;
    tx: string;
    wallet: string;
    tokens: number;
    amount: number;
    rate: number;
    updateDate: string;
}

export interface IForgotPasswordResponse {
    id: number;
    wallet: string;
    pin: string;
    date: string;
}

export interface ITransferLogResponse {
    id: number;
    from: string;
    to: string;
    info: string;
    mintAddress: string;
    amount: number;
    date: string;
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

export interface IAddRedeemRequest {
    email: string;
    tx: string;
    tokens: number;
    rate: number;
}

export interface IAddFlexibleDepositAdminRequest {
    publicKey: string;
    tx: string;
    token: string;
    amount: number;
}

export interface IAddEndDateDepositAdminRequest {
    publicKey: string;
    tx: string;
    token: string;
    amount: number;
    days: number;
}

// P2P Models

export interface IP2PUserKYCResponse {
    id: number;
    date: string;
    firstName: string;
    lastName: string;
    status: number;
    comment: string;
}

export interface IP2PUserResponse {
    id: number;
    date: string;
    lastOnlineDate: string;
    wallet: string;
    nickname: string;
    contactMethod: string;
    contactInfo: string;
    completedOrders: number;
    likes: number;
    dislikes: number;
    processed: boolean;
    kyc: IP2PUserKYCResponse;
}

export interface IP2PPublicUserInfoResponse {
    lastOnlineDate: string;
    nickname: string;
    contactMethod: string;
    contactInfo: string;
    completedOrders: number;
    likes: number;
    dislikes: number;
    processed: boolean;
}

export interface IP2PPaymentDetails {
    bank?: string;
    bankAccount?: string;
    accountHolder?: string;
    bic?: string;
    bankAddress?: string;
    routing?: string;
}

export interface IP2PAdResponse {
    id: number;
    date: string;
    updateDate: string;
    user: IP2PPublicUserInfoResponse;
    side: number;
    coin: string;
    mint: string;
    currency: string;
    price: number;
    amount: number;
    minAmount: number;
    lockedAmount: number;
    leftAmount: number;
    fee: number;
    paymentMethod: string;
    paymentDetails: IP2PPaymentDetails;
    comment: string;
    lockTransactionId: string;
    cancelTransactionId: string;
    status: number;
    isReviewed: boolean;
    // orders: P2POrderResponse[];
}

export interface IP2POrderResponse {
    id: number;
    adId: number;
    user: IP2PPublicUserInfoResponse;
    adUser: IP2PPublicUserInfoResponse;
    reviewedByUser: boolean;
    reviewedByAdUser: boolean;
    date: string;
    updateDate: string;
    price: number;
    adFee: number;
    amount: number;
    coin: string;
    mint: string;
    currency: string;
    paymentMethod: string;
    paymentDetails: IP2PPaymentDetails;
    changeLog: any;
    chat: any;
    status: number;
    side: number;
    comment: string;
    transactionId: string;
    lockTransactionId: string;
    cancelTransactionId: string;
}

export interface P2PUserReviewResponse {
    id: number;
    orderId: number;
    date: string;
    user: IP2PPublicUserInfoResponse;
    reviewLeftBy: IP2PPublicUserInfoResponse;
    isPositive: boolean;
    comment: string;
}

export interface IP2PChangeOrderRequest {
    id: number;
    status?: number;
    paymentDetails?: IP2PPaymentDetails;
    comment?: string;
    currency?: string;
    paymentMethod?: string;
    txId?: string;
    lockTxId?: string;
    cancelTxId?: string;
    price?: number;
    amount?: number;
}

export interface IP2PChangeAdRequest {
    id: number;
    status?: number;
    paymentDetails?: IP2PPaymentDetails;
    paymentMethod?: string;
    currency?: string;
    comment?: string;
    lockTxId?: string;
    cancelTxId?: string;
    price?: number;
    amount?: NumberColorSetType;
    lockAmount?: number;
    leftAmount?: number;
    minAmount?: number;
}