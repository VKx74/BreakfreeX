import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { ComponentIdentifier } from "@app/models/app-config";
import { BaseLayoutItem } from '@layout/base-layout-item';
import { IdentityService } from '@app/services/auth/identity.service';
import { InstrumentService } from '@app/services/instrument.service';
import { EconomicCalendarService } from '@calendarEvents/localization/token';
import { AlgoService, IEconomicEvent } from '@app/services/algo.service';
import { MatDialog } from "@angular/material/dialog";
import { CheckoutComponent } from 'modules/BreakfreeTrading/components/checkout/checkout.component';

class EconomicCalendarGroupVM {
    Date: string;
    Items: EconomicCalendarVM[];
}

class EconomicCalendarVM {
    Name: string;
    Description: any;
    HTMLDescription: string;
    InternationalCountryCode: string;
    CountryName: string;
    EventTypeDescription: string;
    Volatility?: number;
    DateUtc: Date;
    Actual?: number;
    Consensus?: number;
    Previous?: number;
    Symbol?: string;
    RiseType: string;
    IsSpeech: boolean;
    IsReport: boolean;
    DateString: string;
    CurrencyId: string;
    IsPassed: boolean;

    public init(event: IEconomicEvent) {
        this.Name = event.Event.Name;
        this.Description = event.Event.Description;
        this.HTMLDescription = event.Event.HTMLDescription;
        this.InternationalCountryCode = event.Event.InternationalCountryCode;
        this.CountryName = event.Event.CountryName;
        this.EventTypeDescription = event.Event.EventTypeDescription;
        this.RiseType = event.Event.RiseType;
        this.Symbol = event.Event.Symbol;
        this.IsSpeech = event.Event.IsSpeech;
        this.IsReport = event.Event.IsReport;
        this.Volatility = event.Volatility;
        this.CurrencyId = event.Event.CurrencyId;
        this.DateUtc = new Date(event.DateUtc);
        this.Actual = event.Actual;
        this.Consensus = event.Consensus;
        this.Previous = event.Previous;

        let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' } as any;
        this.DateString = this.DateUtc.toLocaleDateString(undefined, options);

        this.IsPassed = this.DateUtc.getTime() < new Date().getTime();
    }
}

@Component({
    selector: 'economic-calendar',
    templateUrl: './economic-calendar.component.html',
    styleUrls: ['./economic-calendar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: TranslateService,
            useExisting: EconomicCalendarService
        }
    ]
})
export class EconomicCalendarComponent extends BaseLayoutItem {
    static componentName = 'EconomicCalendar';
    static previewImgClass = 'crypto-icon-watchlist';

    private _updateInterval: any;
    private _reloadInterval: any;
    private _changesDetected: boolean;

    loading: boolean;
    items: EconomicCalendarGroupVM[] = [];

    get componentId(): string {
        return EconomicCalendarComponent.componentName;
    }

    get hasAccess(): boolean {
        return this._identityService.isAuthorizedCustomer;
    }

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    constructor(protected _dialog: MatDialog, protected _translateService: TranslateService, protected _algoService: AlgoService, protected _instrumentService: InstrumentService, protected _cdr: ChangeDetectorRef, protected _identityService: IdentityService) {
        super();
    }

    getState() {
        return null;
    }

    setState(state: any) {
    }

    ngOnInit() {
        this.initialized.next(this);

        if (!this.hasAccess) {
            return;
        }

        this.loading = true;

        this._updateInterval = setInterval(() => {
            if (this._changesDetected) {
                this._cdr.markForCheck();
            }
            this._changesDetected = false;
        }, 500);

        this._reloadInterval = setInterval(() => {
            // this.loadData();
        }, 60 * 1000);

        this.loadData();
    }

    ngOnDestroy() {
        this.beforeDestroy.next(this);

        if (this._updateInterval) {
            clearInterval(this._updateInterval);
        }

        if (this._reloadInterval) {
            clearInterval(this._reloadInterval);
        }
    }

    processCheckout() {
        this._dialog.open(CheckoutComponent, { backdropClass: 'backdrop-background' });
    }

    getCountryFlag(event: EconomicCalendarVM) {
        if (!event.InternationalCountryCode) {
            return "";
        }

        return `country-flag_${event.InternationalCountryCode.toLowerCase()}`;
    }

    protected loadData() {
        this._algoService.getEconomicalEvents().subscribe((data) => {
            let loadedItems: EconomicCalendarVM[] = [];
            for (let item of data) {
                let i = new EconomicCalendarVM();
                i.init(item);
                loadedItems.push(i);
            }

            this.items = [];

            for (let loadedItem of loadedItems) {
                let existingItem: EconomicCalendarGroupVM = null;
                for (let item of this.items) { 
                    if (item.Date === loadedItem.DateString) {
                        existingItem = item;
                        break;
                    }
                }

                if (!existingItem) {
                    existingItem = new EconomicCalendarGroupVM();
                    existingItem.Date = loadedItem.DateString;
                    existingItem.Items = [];
                    this.items.push(existingItem);
                }

                existingItem.Items.push(loadedItem);
            }

            this.loading = false;
            this._changesDetected = true;
        });
    }

    private _raiseStateChanged() {
        this.stateChanged.next(this);
    }

}
