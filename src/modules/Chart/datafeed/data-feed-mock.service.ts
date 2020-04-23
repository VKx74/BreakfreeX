import {DataFeedBase} from './DataFeedBase';
import {Injectable} from "@angular/core";
import {IBarData} from "../../../app/models/common/barData";
import {RequestKind} from "./models";
import {TimeZoneManager} from "../../TimeZones/services/timeZone.manager";

@Injectable()
export class DataFeedMock extends DataFeedBase {

    private _bars: IBarData[] = [];

    constructor(protected _timeZoneManager: TimeZoneManager) {
        super(_timeZoneManager);
        this.instruments = [];
    }

    init(bars: IBarData[]): Promise<DataFeedBase> {
        this._bars = bars;
        return Promise.resolve(this);
    }

    /**
     * @inheritDoc
     */
    sendRequest(request: TradingChartDesigner.IBarsRequest) {
        super.sendRequest(request);
        this._sendRequest(request);
    }

    destroy() {
        super.destroy();
    }

    private _sendRequest(request: TradingChartDesigner.IBarsRequest) {
        if (request.name === RequestKind.MORE_BARS) {
            this.onRequestCompleted(request, []);
        } else {
            this.onRequestCompleted(request, this._bars);
        }

        request.chart.canLoadMoreBars = false;
    }
}
