import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {
    BlockchainDTO,
    CreateBlockchainDTO,
    CreateCurrencyDTO,
    CreateMarketDTO,
    CreateWalletDTO,
    CurrenciesSummaryDTO,
    CurrencyDTO,
    DepositDTO,
    DepositState,
    GetBlockchainResponse,
    GetCollectionResponse,
    GetCurrencyResponse,
    GetMarketResponse,
    IAccount,
    IAccountFiltrationParams,
    IBaseAccount,
    MarketDTO,
    UpdateBlockchainDTO,
    UpdateCurrencyDTO,
    UpdateMarketDTO,
    UpdateWalletDTO,
    WalletDTO,
    WithdrawDTO,
    WithdrawState
} from "@app/models/exchange/models";
import {AppConfigService} from "@app/services/app.config.service";
import {map} from "rxjs/operators";
import {
    IExchangeAccount,
    IExchangeAccountFiltrationParams,
    IExportEchangeDataFiltrationParams,
    QueryParamsConstructor
} from "../data/models";
import {
    CollectionResponseType,
    IDataCountResponse,
    IPaginationResponse,
    PaginationParams,
    toBasePaginationResponse
} from "@app/models/pagination.model";
import {IBaseUserModel} from "@app/models/auth/auth.models";
import {IWalletTransaction} from "../../Trading/models/crypto/crypto.models";

interface IBlobRequestOptions {
    headers?: HttpHeaders | {
        [header: string]: string | string[];
    };
    observe?: 'body';
    params?: HttpParams | {
        [param: string]: string | string[];
    };
    reportProgress?: boolean;
    responseType: 'blob';
    withCredentials?: boolean;
}

@Injectable({
    providedIn: "root"
})
export class ExchangeManagementApiService {
    constructor(private _http: HttpClient) {
    }

    getCurrencies(params = new PaginationParams()): Observable<GetCurrencyResponse> {
        let queryParams = QueryParamsConstructor.fromObject(params.toSkipTake());
        return this._http.get<GetCurrencyResponse>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Currencies`, {params: queryParams});
    }

    getCurrency(id: string): Observable<CurrencyDTO> {
        return this.getCurrencies()
            .pipe(
                map((res: GetCurrencyResponse) => {
                    return res.data.find(c => c.id === id);
                })
            );
    }

    createCurrency(dto: CreateCurrencyDTO): Observable<CurrencyDTO> {
        return this._http.post<CurrencyDTO>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Currencies`, dto);
    }

    updateCurrency(id: string, dto: UpdateCurrencyDTO): Observable<CurrencyDTO> {
        return this._http.put<CurrencyDTO>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Currencies/${id}`, dto);
    }

    deleteCurrency(id: string): Observable<any> {
        return this._http.delete(`${AppConfigService.config.apiUrls.exchangeManagementREST}Currencies/${id}`);
    }

    getBlockchains(params = new PaginationParams()): Observable<GetBlockchainResponse> {
        const queryParams = QueryParamsConstructor.fromObject(params.toSkipTake());
        return this._http.get<GetBlockchainResponse>(`${AppConfigService.config.apiUrls.exchangeManagementREST}blockchains`, {params: queryParams});
    }

    getBlockchain(id: number): Observable<BlockchainDTO> {
        return this.getBlockchains()
            .pipe(
                map((res: GetBlockchainResponse) => {
                    const result = res.data.find(c => c.id === id);

                    if (result == null) {
                        throw new Error('Item not found');
                    }

                    return result;
                })
            );
    }

    createBlockchain(dto: CreateBlockchainDTO): Observable<BlockchainDTO> {
        return this._http.post<BlockchainDTO>(`${AppConfigService.config.apiUrls.exchangeManagementREST}blockchains`, dto);
    }

    updateBlockchain(id: number, dto: UpdateBlockchainDTO): Observable<BlockchainDTO> {
        return this._http.put<BlockchainDTO>(`${AppConfigService.config.apiUrls.exchangeManagementREST}blockchains/${id}`, dto);
    }

    deleteBlockchain(id: number): Observable<any> {
        return this._http.delete(`${AppConfigService.config.apiUrls.exchangeManagementREST}blockchains/${id}`);
    }

    getMarkets(params = new PaginationParams()): Observable<GetMarketResponse> {
        return this._http.get<GetMarketResponse>(`${AppConfigService.config.apiUrls.exchangeManagementREST}markets`,
            {params: QueryParamsConstructor.fromObject(params.toSkipTake())});
    }

    getMarket(id: string): Observable<MarketDTO> {
        return this.getMarkets()
            .pipe(
                map((res: GetMarketResponse) => {
                    const result = res.data.find(c => c.id === id);

                    if (result == null) {
                        throw new Error('Item not found');
                    }

                    return result;
                })
            );
    }

    updateMarket(id: string, dto: UpdateMarketDTO): Observable<MarketDTO> {
        return this._http.put<MarketDTO>(`${AppConfigService.config.apiUrls.exchangeManagementREST}markets/${id}`, dto);
    }

    createMarket(dto: CreateMarketDTO): Observable<MarketDTO> {
        return this._http.post<MarketDTO>(`${AppConfigService.config.apiUrls.exchangeManagementREST}markets`, dto);
    }

    deleteMarket(id: string): Observable<any> {
        return this._http.delete(`${AppConfigService.config.apiUrls.exchangeManagementREST}markets/${id}`);
    }


    getWallets(params = new PaginationParams()): Observable<IDataCountResponse<WalletDTO>> {
        return this._http.get<IDataCountResponse<WalletDTO>>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Wallets`,
            {params: QueryParamsConstructor.fromObject(params.toSkipTake())});
    }

    createWallet(dto: CreateWalletDTO): Observable<WalletDTO> {
        return this._http.post<WalletDTO>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Wallets`, dto);
    }

    updateWallet(id: number, dto: UpdateWalletDTO): Observable<WalletDTO> {
        return this._http.put<WalletDTO>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Wallets/${id}`, dto);
    }

    deleteWallet(id: number): Observable<any> {
        return this._http.delete(`${AppConfigService.config.apiUrls.exchangeManagementREST}Wallets/${id}`);
    }

    getWithdraws(params = new PaginationParams(), filtrationParams: object): Observable<GetCollectionResponse<WithdrawDTO>> {
        return this._http.get<GetCollectionResponse<WithdrawDTO>>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Withdraws`,
            {
                params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
            });
    }

    getWithdrawsByEmailForUser(email: string): Observable<IWalletTransaction[]> {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append( "apiKey",  "8e738606c9ba4315aae2ef0ac15d6740");
        return this._http.get<IWalletTransaction[]>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Withdraws/ByEmail/${email}`, {headers});
    }

    getWithdraw(id: number): Observable<WithdrawDTO> {
        return this._http.get<WithdrawDTO>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Withdraws/${id}`);
    }

    updateWithdrawStatus(id: number, status: WithdrawState): Observable<any> {
        return this._http.put<any>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Withdraws/${id}/state/?withdrawStatus=${status}`, null);
    }

    getDeposits(paginationParams = new PaginationParams(), filtrationParams?: object): Observable<IPaginationResponse<DepositDTO>> {
        const queryParams = QueryParamsConstructor.fromObjects(paginationParams.toSkipTake(), filtrationParams);
        return this._http.get<IPaginationResponse<DepositDTO>>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Deposits`,
            {
                params: queryParams,
                withCredentials: true
            })
            .pipe(
                toBasePaginationResponse(CollectionResponseType.DataCount)
            );
    }

    getDepositsByEmailForUser(email: string): Observable<IWalletTransaction[]> {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append( "apiKey",  "8e738606c9ba4315aae2ef0ac15d6740");
        return this._http.get<IWalletTransaction[]>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Deposits/ByEmail/${email}`, {headers});
    }

    // updateDeposit(id: number, status: string): Observable<any> {
    //     return this._http.put<any>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Deposits/${id}/?depositStatus=${status}`, null);
    // }
    updateDeposit(id: number, status: string): Observable<any> {
        return this._http.put<any>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Deposits/${id}/state`, {
            depositStatus: status
        });
    }

    getExchangeSummary(): Observable<number> {
        return this._http.get<number>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Dashboard/ExchangeSummary`);
    }

    getCurrenciesSummary(): Observable<CurrenciesSummaryDTO[]> {
        return this._http.get<CurrenciesSummaryDTO[]>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Dashboard/CurrenciesSummary`);
    }

    getAccounts(params = new PaginationParams(), filtrationParams?: IAccountFiltrationParams): Observable<IPaginationResponse<IAccount>> {
        return this._http.get<IPaginationResponse<IAccount>>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Account`, {
            params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
        }).pipe(
            toBasePaginationResponse(CollectionResponseType.DataCount)
        );
    }

    createAccount(dto: IBaseAccount): Observable<IAccount> {
        return this._http.post<IAccount>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Account`, dto);
    }

    updateAccount(id: number, dto: IBaseAccount): Observable<IAccount> {
        return this._http.put<IAccount>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Account/${id}`, dto);
    }

    deleteAccount(id: number): Observable<IAccount> {
        return this._http.delete<IAccount>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Account/${id}`);
    }

    getUsersProfiles(ids: any[], params?: PaginationParams, filtrationParams?: IExchangeAccountFiltrationParams): Observable<IPaginationResponse<IBaseUserModel>> {
        return this._http.get<IPaginationResponse<IExchangeAccount>>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Account`, {
            params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
        }).pipe(
            toBasePaginationResponse(CollectionResponseType.DataCount)
        );
    }

    exportOrders(params: IExportEchangeDataFiltrationParams): Observable<Blob> {
        return this._http.get(`${AppConfigService.config.apiUrls.exchangeManagementREST}Export/Orders`, this.getExportExchangeUnitOptions(params));
    }

    exportUsers(params: IExportEchangeDataFiltrationParams): Observable<Blob> {
        return this._http.get(`${AppConfigService.config.apiUrls.exchangeManagementREST}Export/Members`, this.getExportExchangeUnitOptions(params));
    }

    exportDeposits(params: IExportEchangeDataFiltrationParams): Observable<Blob> {
        return this._http.get(`${AppConfigService.config.apiUrls.exchangeManagementREST}Export/Deposit`, this.getExportExchangeUnitOptions(params));
    }

    exportWithdraws(params: IExportEchangeDataFiltrationParams): Observable<Blob> {
        return this._http.get(`${AppConfigService.config.apiUrls.exchangeManagementREST}Export/Withdraw`, this.getExportExchangeUnitOptions(params));
    }

    exportWallets(params: IExportEchangeDataFiltrationParams): Observable<Blob> {
        return this._http.get(`${AppConfigService.config.apiUrls.exchangeManagementREST}Export/Wallets`, this.getExportExchangeUnitOptions(params));
    }

    exportTrades(params: IExportEchangeDataFiltrationParams): Observable<Blob> {
        return this._http.get(`${AppConfigService.config.apiUrls.exchangeManagementREST}Export/Trades`, this.getExportExchangeUnitOptions(params));
    }

    getExportExchangeUnitOptions(params: IExportEchangeDataFiltrationParams): IBlobRequestOptions {
        return {
            params: QueryParamsConstructor.fromObjects(params),
            responseType: 'blob'
        };
    }
}
