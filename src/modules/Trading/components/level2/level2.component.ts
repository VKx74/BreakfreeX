import {Component, Inject, Injector, Optional} from "@angular/core";
import {ILevel2DataItem, Level2DataType, Level2SimulateService} from "../../services/level2-simulate.service";
import {IInstrument} from "@app/models/common/instrument";
import {InstrumentService} from "@app/services/instrument.service";
import {TranslateService} from "@ngx-translate/core";
import {TradingTranslateService} from "../../localization/token";
import {LocalizationService} from "Localization";
import {Actions, LinkingAction} from "../../../Linking/models";
import {BaseLayoutItemComponent} from "@layout/base-layout-item.component";
import {GoldenLayoutItemState} from "angular-golden-layout";


interface ILevel {
    value: number;
    index: number;
    dataItems: ILevel2DataItem[];
}

export interface ILevel2ComponentState {
    bidLevels: ILevel[];
    askLevels: ILevel[];
    bidLevel2DataItems: ILevel2DataItem[];
    askLevel2DataItems: ILevel2DataItem[];
    activeInstrument: IInstrument;
}

@Component({
    selector: 'level2',
    templateUrl: 'level2.component.html',
    styleUrls: ['level2.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class Level2Component extends BaseLayoutItemComponent {
    static componentName = 'Level 2 View';
    static previewImgClass = 'crypto-icon-l2';

    bidLevels: ILevel[] = [];
    askLevels: ILevel[] = [];

    bidLevel2DataItems: ILevel2DataItem[] = [];
    askLevel2DataItems: ILevel2DataItem[] = [];
    activeInstrument: IInstrument;
    private _interval: any;

    constructor(@Optional() @Inject(GoldenLayoutItemState) protected _state: ILevel2ComponentState,
                private _instrumentService: InstrumentService,
                private _translateService: TranslateService,
                private _localizationService: LocalizationService,
                private _level2SimulateService: Level2SimulateService,
                protected _injector: Injector) {
        super(_injector);

        super.setTitle(
            this._translateService.stream('level2ComponentName')
        );
    }

    ngOnInit() {
        if (this._state) {
            this.loadState(this._state);
        }

        this._initLinking();
    }

    private _initLinking() {
        this.linker.onAction((action: LinkingAction) => {
            if (action.type === Actions.ChangeInstrument) {
                if (action.data !== this.activeInstrument) {
                    this.bidLevels = [];
                    this.askLevels = [];
                    this.bidLevel2DataItems = [];
                    this.askLevel2DataItems = [];
                    this.setInstrument(action.data);
                    this._simulateQuotes();
                    this.fireStateChanged();
                }
            }
        });
    }

    private _sendInstrumentChange(instrument: IInstrument) {
        const linkAction: LinkingAction = {
            type: Actions.ChangeInstrument,
            data: instrument
        };
        this.linker.sendAction(linkAction);
    }

    handleInstrumentChange(instrument: IInstrument) {
        this._sendInstrumentChange(instrument);
        this.bidLevels = [];
        this.askLevels = [];
        this.bidLevel2DataItems = [];
        this.askLevel2DataItems = [];
        this.setInstrument(instrument);

        this._simulateQuotes();
        this.fireStateChanged();
    }

    private _simulateQuotes() {
        if (this._interval) {
            clearInterval(this._interval);
        }

        this._interval = setInterval(() => {
            const leve2DataItem = this._level2SimulateService.getLevel2DataItem();
            const level2DataItemsBuffer = leve2DataItem.type === Level2DataType.bid ? this.bidLevel2DataItems : this.askLevel2DataItems;

            const index = level2DataItemsBuffer.findIndex(item => item.marketMaker === leve2DataItem.marketMaker);

            if (index !== -1) {
                level2DataItemsBuffer.splice(index, 1);
            }

            level2DataItemsBuffer.push(leve2DataItem);

            if (leve2DataItem.type === Level2DataType.bid) {
                this.bidLevels = this._calculateLevels(this.bidLevel2DataItems, Level2DataType.bid);
            } else {
                this.askLevels = this._calculateLevels(this.askLevel2DataItems, Level2DataType.ask);
            }
        }, 250);
    }

    private _calculateLevels(dataItems: ILevel2DataItem[], dataType: Level2DataType): ILevel[] {
        const sortedDataItems = this._sortLevel2Data(dataItems, dataType);
        const levels: ILevel[] = [];

        for (const dataItem of sortedDataItems) {
            const index = levels.findIndex((l) => l.value === dataItem.value);

            if (index === -1) {
                levels.push({
                    value: dataItem.value,
                    index: levels.length + 1,
                    dataItems: [dataItem]
                });
            } else {
                levels[index].dataItems.push(dataItem);
            }
        }

        return levels;
    }

    private _sortLevel2Data(data: ILevel2DataItem[], dataType: Level2DataType): ILevel2DataItem[] {
        return data.slice().sort((a, b) => {
            if (a.value > b.value) {
                return dataType === Level2DataType.ask ? 1 : -1;
            } else if (a.value < b.value) {
                return dataType === Level2DataType.ask ? -1 : 1;
            }

            return 0;
        });
    }

    loadState(state: ILevel2ComponentState) {
        if (state.activeInstrument == null) {
            return;
        }

        this.bidLevels = state.bidLevels;
        this.askLevels = state.askLevels;
        this.bidLevel2DataItems = state.bidLevel2DataItems;
        this.askLevel2DataItems = state.askLevel2DataItems;
        this.setInstrument(state.activeInstrument);

        this._simulateQuotes();
    }

    protected getComponentState(): any {
        return {
            bidLevels: this.bidLevels,
            askLevels: this.askLevels,
            bidLevel2DataItems: this.bidLevel2DataItems,
            askLevel2DataItems: this.askLevel2DataItems,
            activeInstrument: this.activeInstrument
        } as ILevel2ComponentState;
    }

    setInstrument(instrument: IInstrument) {
        this.activeInstrument = instrument;
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        if (this._interval) {
            clearInterval(this._interval);
        }
    }
}
