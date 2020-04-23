// Blockchains region

import {FiltrationParams} from "@app/models/filtration-params";

export enum BlockchainStatus {
    active = 'active',
    disabled = 'disabled'
}

export enum BlockchainClient {
    Bitcoin = 'bitcoin',
    BitcoinCash = 'bitcoincash',
    Dash = 'dash',
    Ethereum = 'ethereum',
    Litecoin = 'litecoin',
    Ripple = 'ripple'
}

export class BlockchainDTO {
    id: number;
    name: string;
    key: string;
    client: BlockchainClient;
    server: string;
    height: number;
    explorerAddress: string;
    explorerTransaction: string;
    minConfirmations: number;
    status: BlockchainStatus;
    createdAt: string;
    updatedAt: string;
}

export interface BaseCollectionResponse {
    count: number;
}

export interface GetCollectionResponse<T> extends BaseCollectionResponse {
    data: T[];
}

export interface GetBlockchainResponse extends GetCollectionResponse<BlockchainDTO> {
}

export interface MappedBlockchainResponse extends GetCollectionResponse<Blockchain> {
}


export class Blockchain {
    id: number;
    name: string;
    key: string;
    client: BlockchainClient = BlockchainClient.Bitcoin;
    server: string;
    height: number = 0;
    explorerAddress: string;
    explorerTransaction: string;
    minConfirmations: number = 6;
    status: BlockchainStatus = BlockchainStatus.active;
    createdAt: string;
    updatedAt: string;

    constructor() {
    }

    static deserialize(dto: BlockchainDTO): Blockchain {
        const model = new Blockchain();
        Object.assign(model, dto);

        return model;
    }

    toCreateDTO(): CreateBlockchainDTO {
        return {
            key: this.key,
            name: this.name,
            client: this.client,
            server: this.server,
            height: this.height,
            explorerAddress: this.explorerAddress,
            explorerTransaction: this.explorerTransaction,
            minConfirmations: this.minConfirmations,
            status: this.status
        };
    }

    toUpdateDTO(): UpdateBlockchainDTO {
        return {
            key: this.key,
            name: this.name,
            client: this.client,
            server: this.server,
            height: this.height,
            explorerAddress: this.explorerAddress,
            explorerTransaction: this.explorerTransaction,
            minConfirmations: this.minConfirmations,
            status: this.status
        };
    }
}

export class CreateBlockchainDTO {
    key: string;
    name: string;
    client: BlockchainClient;
    server: string;
    height: number;
    explorerAddress: string;
    explorerTransaction: string;
    minConfirmations: number;
    status: BlockchainStatus;
}

export class UpdateBlockchainDTO {
    key: string;
    name: string;
    client: BlockchainClient;
    server: string;
    height: number;
    explorerAddress: string;
    explorerTransaction: string;
    minConfirmations: number;
    status: BlockchainStatus;
}


// End Blockchains region

// Currencies region

export enum CurrencyType {
    Coin = 'coin',
    Fiat = 'fiat'
}

export interface GetCurrencyResponse extends GetCollectionResponse<CurrencyDTO> {
}

export interface MappedCurrencyResponse extends GetCollectionResponse<Currency> {
}

export class CurrencyDTO {
    id: string;
    name: string;
    blockchainKey: string;
    symbol: string;
    type: CurrencyType;
    depositFee: number;
    minDepositAmount: number;
    minCollectionAmount: number;
    withdrawLimit24h: number;
    withdrawLimit72h: number;
    options: string;
    enabled: boolean;
    baseFactor: number;
    precision: number;
    iconUrl: string;
    createdAt: string;
    updatedAt: string;
}

export class CreateCurrencyDTO {
    id: string;
    name: string;
    blockchainKey: string;
    symbol: string;
    type: CurrencyType;
    depositFee: number;
    minDepositAmount: number;
    minCollectionAmount: number;
    withdrawLimit24h: number;
    withdrawLimit72h: number;
    options: string;
    enabled: boolean;
    baseFactor: number;
    precision: number;
    iconUrl: string;
}

export class UpdateCurrencyDTO {
    id: string;
    name: string;
    blockchainKey: string;
    symbol: string;
    type: CurrencyType;
    depositFee: number;
    minDepositAmount: number;
    minCollectionAmount: number;
    withdrawLimit24h: number;
    withdrawLimit72h: number;
    options: string;
    enabled: boolean;
    baseFactor: number;
    precision: number;
    iconUrl: string;
}

export class Currency {
    id: string;
    name: string;
    blockchainKey: string;
    symbol: string;
    type: CurrencyType = CurrencyType.Fiat;
    depositFee: number = 0;
    minDepositAmount: number = 0;
    minCollectionAmount: number = 0;
    withdrawLimit24h: number = 0;
    withdrawLimit72h: number = 0;
    options: string = "";
    enabled: boolean = false;
    baseFactor: number = 1;
    precision: number = 8;
    iconUrl: string;
    createdAt: Date;
    updatedAt: Date;

    static deserialize(dto: CurrencyDTO): Currency {
        const model = new Currency();
        Object.assign(model, dto);

        model.createdAt = new Date(dto.createdAt);
        model.updatedAt = new Date(dto.updatedAt);

        return model;
    }

    toCreateDTO(): CreateCurrencyDTO {
        return {
            id: this.id,
            name: this.name,
            blockchainKey: this.blockchainKey,
            symbol: this.symbol,
            type: this.type,
            depositFee: this.depositFee,
            minDepositAmount: this.minDepositAmount,
            minCollectionAmount: this.minCollectionAmount,
            withdrawLimit24h: this.withdrawLimit24h,
            withdrawLimit72h: this.withdrawLimit72h,
            options: this.options,
            enabled: this.enabled,
            baseFactor: this.baseFactor,
            precision: this.precision,
            iconUrl: this.iconUrl
        };
    }

    toUpdateDTO(): UpdateCurrencyDTO {
        return {
            id: this.id,
            name: this.name,
            blockchainKey: this.blockchainKey,
            symbol: this.symbol,
            type: this.type,
            depositFee: this.depositFee,
            minDepositAmount: this.minDepositAmount,
            minCollectionAmount: this.minCollectionAmount,
            withdrawLimit24h: this.withdrawLimit24h,
            withdrawLimit72h: this.withdrawLimit72h,
            options: this.options,
            enabled: this.enabled,
            baseFactor: this.baseFactor,
            precision: this.precision,
            iconUrl: this.iconUrl
        };
    }
}

// End Currencies region


// Markets region

export class MarketDTO {
    id: string;
    askUnit: string;
    bidUnit: string;
    askFee: number;
    bidFee: number;
    maxBid: number;
    minAsk: number;
    minBidAmount: number;
    minAskAmount: number;
    askPrecision: number;
    bidPrecision: number;
    position: number;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export class UpdateMarketDTO {
    askUnit: string;
    bidUnit: string;
    askFee: number;
    bidFee: number;
    maxBid: number;
    minAsk: number;
    minBidAmount: number;
    minAskAmount: number;
    askPrecision: number;
    bidPrecision: number;
    position: number;
    enabled: boolean;
}

export class CreateMarketDTO {
    id: string;
    askUnit: string;
    bidUnit: string;
    askFee: number;
    bidFee: number;
    maxBid: number;
    minAsk: number;
    minBidAmount: number;
    minAskAmount: number;
    askPrecision: number;
    bidPrecision: number;
    position: number;
    enabled: boolean;
}

export interface GetMarketResponse extends GetCollectionResponse<MarketDTO> {
}

export interface MappedMarketResponse extends GetCollectionResponse<MarketModel> {
}

export class MarketModel {
    id: string;
    askUnit: string;
    bidUnit: string;
    askFee: number;
    bidFee: number;
    maxBid: number;
    minAsk: number;
    minBidAmount: number;
    minAskAmount: number;
    askPrecision: number = 8;
    bidPrecision: number = 8;
    position: number = 1;
    enabled: boolean = true;
    createdAt: string;
    updatedAt: string;

    static deserialize(dto: MarketDTO): MarketModel {
        const model = new MarketModel();
        Object.assign(model, dto);

        return model;
    }

    toUpdateDTO(): UpdateMarketDTO {
        return {
            askUnit: this.askUnit,
            bidUnit: this.bidUnit,
            askFee: this.askFee,
            bidFee: this.bidFee,
            maxBid: this.maxBid,
            minAsk: this.minAsk,
            minBidAmount: this.minBidAmount,
            minAskAmount: this.minAskAmount,
            askPrecision: this.askPrecision,
            bidPrecision: this.bidPrecision,
            position: this.position,
            enabled: this.enabled
        };
    }

    toCreateDTO(): CreateMarketDTO {
        return {
            id: this._generateId(),
            askUnit: this.askUnit,
            bidUnit: this.bidUnit,
            askFee: this.askFee,
            bidFee: this.bidFee,
            maxBid: this.maxBid,
            minAsk: this.minAsk,
            minBidAmount: this.minBidAmount,
            minAskAmount: this.minAskAmount,
            askPrecision: this.askPrecision,
            bidPrecision: this.bidPrecision,
            position: this.position,
            enabled: this.enabled
        };
    }

    private _generateId(): string {
        if (!this.askUnit || !this.bidUnit)
            throw new Error('Failed to generate id');

        return `${this.askUnit}${this.bidUnit}`;
    }
}


// End Markets region


// Wallets region

export enum WalletKind {
    Deposit = 100,
    Fee = 200,
    Hot = 310,
    Warm = 320,
    Cold = 330
}

export enum WalletStatus {
    Active = 'active',
    Disabled = 'disabled'
}

export function walletStatusToStr(status: WalletStatus): string {
    const map = {
        [WalletStatus.Active]: 'Active',
        [WalletStatus.Disabled]: 'Disabled'
    };

    return map[status];
}

export enum WalletGateway {
    Geth = 'geth',
    Bitcoind = 'bitcoind',
    BitcoinCashd = 'bitcoincashd',
    Rippled = 'rippled',
    Litecoind = 'litecoind',
    Dashd = 'dashd',
    Bitgo = 'bitgo'
}

export class WalletDTO {
    id: number;
    blockchainKey: string;
    currencyId: string;
    name: string;
    address: string;
    kind: WalletKind;
    nsig: number;
    gateway: string;
    settings: string;
    maxBalance: number;
    parent: number;
    status: WalletStatus;
    createdAt: string;
    updatedAt: string;
}

export class UpdateWalletDTO {
    blockchainKey: string;
    currencyId: string;
    name: string;
    address: string;
    kind: WalletKind;
    nsig: number;
    gateway: WalletGateway;
    settings: string;
    maxBalance: number;
    parent: number;
    status: WalletStatus;
}

export class CreateWalletDTO {
    blockchainKey: string;
    currencyId: string;
    name: string;
    address: string;
    kind: WalletKind;
    nsig: number;
    gateway: WalletGateway;
    settings: string;
    maxBalance: number;
    parent: number;
    status: WalletStatus;
}

export interface GetWalletResponse extends GetCollectionResponse<WalletDTO> {
}

export interface MappedWalletResponse extends GetCollectionResponse<WalletModel> {
}

export class WalletModel {
    id: number;
    blockchainKey: string;
    currencyId: string;
    name: string;
    address: string;
    kind: WalletKind = WalletKind.Cold;
    nsig: number;
    gateway: WalletGateway;
    maxBalance: number;
    parent: number = 0;
    status: WalletStatus = WalletStatus.Active;
    uri: string;
    secret: string;
    createdAt: string;
    updatedAt: string;

    static deserialize(dto: WalletDTO): WalletModel {
        const model = new WalletModel();
        Object.assign(model, dto);

        const parsedSettings: { uri: string, secret: string } = JSON.parse(dto.settings);
        model.uri = parsedSettings.uri;
        model.secret = parsedSettings.secret;

        delete model['settings']; // temp

        return model;
    }

    toUpdateDTO(): UpdateWalletDTO {
        return {
            blockchainKey: this.blockchainKey,
            currencyId: this.currencyId,
            name: this.name,
            address: this.address,
            kind: this.kind,
            nsig: this.nsig,
            gateway: this.gateway,
            settings: JSON.stringify({uri: this.uri, secret: this.secret}),
            maxBalance: this.maxBalance,
            parent: this.parent,
            status: this.status,
        };
    }

    toCreateDTO(): CreateWalletDTO {
        return {
            blockchainKey: this.blockchainKey,
            currencyId: this.currencyId,
            name: this.name,
            address: this.address,
            kind: this.kind,
            nsig: this.nsig,
            gateway: this.gateway,
            settings: JSON.stringify({uri: this.uri, secret: this.secret}),
            maxBalance: this.maxBalance,
            parent: this.parent,
            status: this.status
        };
    }
}

// End Wallets region

// Account region
export interface IBaseAccount {
    memberId: number;
    currencyId: string;
    balance: number;
    locked: number;
    email: string;
}

export interface IAccount extends IBaseAccount {
    id: number;
    createdAt: string;
    updatedAt: string;
}

export class Account implements IBaseAccount {
    balance: number;
    currencyId: string;
    locked: number;
    memberId: number;
    email: string;


    constructor(balance: number, currencyId: string, locked: number, memberId: number, email: string) {
        this.balance = balance;
        this.currencyId = currencyId;
        this.locked = locked;
        this.memberId = memberId;
        this.email = email;
    }
}

export enum AccountSortByField {
    None = 'None',
    Balance = 'Balance',
    Locked = 'Locked',
    CreateTime = 'CreateTime',
}

export interface IAccountFiltrationParams {
    memberId: number;
    search: string;
    currency: string;
    accountsSortFields: AccountSortByField;
    descending: boolean;
}

export class AccountFiltrationParams extends FiltrationParams<IAccountFiltrationParams> implements IAccountFiltrationParams {
    accountsSortFields: AccountSortByField;
    currency: string;
    descending: boolean;
    memberId: number;
    search: string;

    toObject(): IAccountFiltrationParams {
        return {
            accountsSortFields: this.accountsSortFields,
            currency:  this.currency,
            descending: this.descending,
            memberId: this.memberId,
            search: this.search,
        };
    }

    toggleDescending() {
        this.descending = !this.descending;
    }

    clearSortData() {
        this.accountsSortFields = null;
        this.descending = null;
    }
}


export class AccountDTO {
    id: number;
    memberId: number;
    email: string;
    currencyId: string;
    locked: number;
    balance: number;
    createdAt: string;
    updatedAt: string;
}

export class UpdateAccountDTO {
    id: number;
    memberId: number;
    email: string;
    currencyId: string;
    locked: number;
    balance: number;
    createdAt: string;
    updatedAt: string;
}

export class CreateAccountDTO {
    id: number;
    memberId: number;
    email: string;
    currencyId: string;
    locked: number;
    balance: number;
    createdAt: string;
    updatedAt: string;
}

export interface GetAccountResponse extends GetCollectionResponse<AccountDTO> {
}

export interface MappedAccountResponse extends GetCollectionResponse<AccountModel> {
}

export class AccountModel {
    id: number;
    memberId: number;
    email: string;
    currencyId: string;
    locked: number;
    balance: number;
    createdAt: string;
    updatedAt: string;

    static deserialize(dto: AccountDTO): AccountModel {
        const model = new AccountModel();
        Object.assign(model, dto);

        return model;
    }

    toUpdateDTO(): UpdateAccountDTO {
        return {
            id: this.id,
            currencyId: this.currencyId,
            memberId: this.memberId,
            email: this.email,
            locked: this.locked,
            balance: this.balance,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    toCreateDTO(): CreateAccountDTO {
        return {
            id: this.id,
            currencyId: this.currencyId,
            memberId: this.memberId,
            email: this.email,
            locked: this.locked,
            balance: this.balance,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

// End Account region

export class ExchangeUserDTO {
    id: number;
    level: number;
    sn: string;
    email: string;
    disabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ExchangeUserModelConfig extends Partial<ExchangeUserModel> {
}

export class ExchangeUserModel {
    id: number;
    level: number;
    sn: string;
    email: string;
    disabled: boolean;
    createdAt: number;
    updatedAt: number;

    constructor(config: ExchangeUserModelConfig = {}) {
        Object.assign(this, config);
    }

    static fromDTO(dto: ExchangeUserDTO): ExchangeUserModel {
        const config: ExchangeUserModelConfig = {
            id: dto.id,
            level: dto.level,
            sn: dto.sn,
            email: dto.email,
            disabled: dto.disabled,
            createdAt: new Date(dto.createdAt).getTime(),
            updatedAt: new Date(dto.updatedAt).getTime()
        };

        return new ExchangeUserModel(config);
    }
}

// Withdraws region

export enum WithdrawState {
    Accepted = 'accepted',
    Submitted = 'submitted',
    Processing = 'processing',
    Confirming = 'confirming',
    Succeed = 'succeed',
    Rejected = 'rejected',
    Canceled = 'canceled',
    Failed = 'failed'
}

export class WithdrawDTO {
    id: number;
    accountId: number;
    memberId: number;
    currencyId: string;
    amount: number;
    fee: number;
    txId: string;
    aasmState: WithdrawState;
    blockNumber: number;
    sum: number;
    type: string;
    tId: string;
    rId: string;
    createdAt: string;
    updatedAt: string;
    completedAt: string;
}

export class CreateWithdrawDTO {
    accountId: number;
    memberId: number;
    currencyId: string;
    amount: number;
    fee: number;
    txId: string;
    aasmState: WithdrawState;
    blockNumber: number;
    sum: number;
    type: string;
    tId: string;
    rId: string;
}

export class UpdateWithdrawDTO {
    accountId: number;
    memberId: number;
    currencyId: string;
    amount: number;
    fee: number;
    txId: string;
    aasmState: WithdrawState;
    blockNumber: number;
    sum: number;
    type: string;
    tId: string;
    rId: string;
}

export class Withdraw {
    id: number;
    accountId: number;
    memberId: number;
    currencyId: string;
    amount: number;
    fee: number;
    txId: string;
    aasmState: WithdrawState;
    blockNumber: number;
    sum: number;
    type: string;
    tId: string;
    rId: string;
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date;

    static deserialize(dto: WithdrawDTO): Withdraw {
        const model: Withdraw = Object.assign(new Withdraw(), dto);

        model.createdAt = new Date(dto.createdAt);
        model.updatedAt = new Date(dto.updatedAt);
        model.completedAt = new Date(dto.completedAt);

        return model;
    }
}

// End Withdraws region

// Deposit region

export enum DepositState {
    Submitted = 'submitted',
    Accepted = 'Accepted',
    Dispatched = 'dispatched',
    Collected = 'collected',
    Reject = 'Reject',
}

export interface GetDepositsResponse extends GetCollectionResponse<DepositDTO> {
}

export class DepositDTO {
    id: number;
    email: string;
    memberId: number;
    currencyId: string;
    amount: number;
    fee: number;
    address: string;
    txId: string;
    txOut?: number;
    aasmState: DepositState;
    blockNumber?: number;
    type: string;
    tId: string;
    createdAt: string;
    updatedAt: string;
    completedAt: string;
}

export class CurrenciesSummaryDTO {
    name: string;
    locked: number;
    balance: number;
    sum: number;
    hot: number;
    cold: number;
}


