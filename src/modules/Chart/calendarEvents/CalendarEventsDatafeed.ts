import {Injectable} from "@angular/core";
import {EventUserService} from "@calendarEvents/services/event-user.service";
import {map, takeUntil} from "rxjs/operators";
import {
    EconomicEvent,
    EconomicEventCreateNotification, EconomicEventDeleteNotification,
    EconomicEventNotification,
    EconomicEventResponseModel, EconomicEventUpdateNotification
} from "@calendarEvents/models/models";
import {EEconomicCalendarNotificationType} from "@calendarEvents/models/enums";
import CalendarEventVolatility = TradingChartDesigner.CalendarEventVolatility;
import {Subject} from "rxjs";
import MarketEventsManager = TradingChartDesigner.MarketEventsManager;
import IMarketEvent = TradingChartDesigner.IMarketEvent;
import IGetMarketEventsParams = TradingChartDesigner.IGetMarketEventsParams;
import MarketEventType = TradingChartDesigner.MarketEventType;

@Injectable()
export class CalendarEventsDatafeed extends TradingChartDesigner.MarketEventsDatafeed {
    private _destroy$ = new Subject<any>();

    constructor(private _calendarEventsService: EventUserService) {
        super();
    }

    init(calendarEventsManager: MarketEventsManager) {
        super.init(calendarEventsManager);

        this._calendarEventsService.subscribeOnNotification()
            .pipe(takeUntil(this._destroy$))
            .subscribe(this._handleEventNotification.bind(this));
    }

    protected _loadEvents(params: IGetMarketEventsParams): Promise<IMarketEvent[]> {
        return this._calendarEventsService.getEvents({
            symbols: [
                params.instrument.symbol
            ]
        })
            .pipe(
                map((resp: EconomicEventResponseModel) => {
                    return resp.tradingEvents.map((event: EconomicEvent) => this._normalizeEvent(event));
                })
            ).toPromise();
    }

    private _handleEventNotification(notification: EconomicEventNotification) {
        if (notification.type === EEconomicCalendarNotificationType.Create) {
            const event: EconomicEvent = (notification as EconomicEventCreateNotification).event;

            if (this._needShowEvent(event)) {
                this.addEvents([this._normalizeEvent(event)]);
            }
        }

        if (notification.type === EEconomicCalendarNotificationType.Update) {
            const event: EconomicEvent = (notification as EconomicEventUpdateNotification).event;

            if (this._needShowEvent(event)) {
                const normalizedEvent: IMarketEvent = this._normalizeEvent(event);

                if (this._isEventExist(normalizedEvent)) {
                    this.updateEvents([normalizedEvent]);
                } else {
                    this.addEvents([normalizedEvent]);
                }

            } else {
                this.removeEvents([event.id]);
            }
        }

        if (notification.type === EEconomicCalendarNotificationType.Delete) {
            this.removeEvents([(notification as EconomicEventDeleteNotification).eventid]);
        }
    }

    private _normalizeEvent(event: EconomicEvent): IMarketEvent {
        return {
            ...event,
            volatility: (event.volatility as any) as CalendarEventVolatility,
            iconUrl: './assets/img/usa.png',
            groupingId: '1',
            type: MarketEventType.Economical
        } as IMarketEvent;
    }

    private _needShowEvent(event: EconomicEvent): boolean {
        const instrument = this._eventsManager.chart.instrument;
        const chartSymbol = instrument.symbol.toLowerCase();

        return event.symbols.some((s) => chartSymbol.indexOf(s.toLowerCase()) !== -1);
    }

    private _isEventExist(event: IMarketEvent): boolean {
        return this._eventsManager.events.some(e => e.id === event.id);
    }

    ngOnDestroy() {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
