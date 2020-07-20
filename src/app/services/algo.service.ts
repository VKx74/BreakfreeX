import {Injectable} from "@angular/core";
import {IInstrument} from "../models/common/instrument";
import {EExchange} from "../models/common/exchange";
import {IHealthable} from "../interfaces/healthcheck/healthable";
import {BehaviorSubject, Observable, of, Subject, Subscription} from "rxjs";
import {ApplicationType} from "../enums/ApplicationType";
import {EBrokerInstance, IBroker, IBrokerState} from "../interfaces/broker/broker";
import {ActionResult, IBrokerUserInfo, OrderTypes} from "../../modules/Trading/models/models";
import {map, catchError} from "rxjs/operators";
import {BrokerFactory, CreateBrokerActionResult} from "../factories/broker.factory";
import {ApplicationTypeService} from "@app/services/application-type.service";
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from './app.config.service';
import { IBFTAlgoParameters } from 'modules/BreakfreeTrading/services/breakfreeTrading.service';

@Injectable()
export class AlgoService {
    private url: string;

    constructor(private _http: HttpClient) {
        this.url = AppConfigService.config.apiUrls.bftAlgoREST;
    }

    calculate(data: IBFTAlgoParameters): Observable<object> {
        return this._http.post(`${this.url}calculate`, data).pipe(
            catchError(error => {
                return of({
                    errorCode: error.status,
                    description: error.error
                });
            }));
    }
}
