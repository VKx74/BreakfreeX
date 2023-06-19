import { Injectable } from "@angular/core";
import { filter, map, takeUntil } from "rxjs/operators";
import CalendarEventVolatility = TradingChartDesigner.CalendarEventVolatility;
import { Subject } from "rxjs";
import IMarketEvent = TradingChartDesigner.IMarketEvent;
import IEconomicalMarketEvent = TradingChartDesigner.IEconomicalMarketEvent;
import IGetMarketEventsParams = TradingChartDesigner.IGetMarketEventsParams;
import MarketEventType = TradingChartDesigner.MarketEventType;
import { AlgoService, IEconomicEvent } from "@app/services/algo.service";
import { CountryCode } from "@calendarEvents/CountryCodes";

@Injectable()
export class CalendarEventsDatafeed extends TradingChartDesigner.MarketEventsDatafeed {
    private _destroy$ = new Subject<any>();

    constructor(protected _algoService: AlgoService) {
        super();
    }

    protected _loadEvents(params: IGetMarketEventsParams): Promise<IMarketEvent[]> {
        return this._algoService.getEconomicalEvents()
            .pipe(
                map((resp: IEconomicEvent[]) => {
                    let filtered = resp.filter((_) => params.instrument.symbol.indexOf(_.Event.CurrencyId) !== -1);
                    let result = filtered.map((event: IEconomicEvent) => this._normalizeEvent(event));
                    return result;
                })
            ).toPromise();
    }

    private _normalizeEvent(event: IEconomicEvent): IEconomicalMarketEvent {
        let actual = "";
        let previous = "";
        let consensus = "";

        if (event.Actual) {
            actual = event.Actual.toString();
            if (event.Event.Symbol === '%') {
                actual = actual + "%";
            } else {
                actual = event.Event.Symbol + actual + event.Event.PotencySymbol;
            }
        }
        if (event.Previous) {
            previous = event.Previous.toString();
            if (event.Event.Symbol === '%') {
                previous = previous + "%";
            } else {
                previous = event.Event.Symbol + previous + event.Event.PotencySymbol;
            }
        }
        if (event.Consensus) {
            consensus = event.Consensus.toString();
            if (event.Event.Symbol === '%') {
                consensus = consensus + "%";
            } else {
                consensus = event.Event.Symbol + consensus + event.Event.PotencySymbol;
            }
        }

        let country = CountryCode.find((_) => _.alpha2Code.toLowerCase() === event.Event.InternationalCountryCode.toLowerCase());

        return {
            id: event.Event.Name,
            iconUrl: country ? './assets/img/flags/' + country.alpha3Code.toLowerCase() + '.png' : "./assets/img/flags/eur.png",
            time: new Date(event.DateUtc).getTime(),
            title: event.Event.Name,
            type: MarketEventType.Economical,
            volatility: this._getVolatility(event.Volatility),
            actual: actual,
            previous: previous,
            consensus: consensus,
            groupingId: event.Event.InternationalCountryCode.toLowerCase()

        } as IEconomicalMarketEvent;
    }

    private _getVolatility(vol: number): CalendarEventVolatility {
        switch (vol) {
            case 0: return CalendarEventVolatility.VeryLow;
            case 1: return CalendarEventVolatility.Low;
            case 2: return CalendarEventVolatility.Medium;
            case 3: return CalendarEventVolatility.High;
            case 4: return CalendarEventVolatility.VeryHigh;
        }
        return CalendarEventVolatility.Low;
    }

    ngOnDestroy() {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
