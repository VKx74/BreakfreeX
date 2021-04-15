import { HttpResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { IPaginationResponse } from "@app/models/pagination.model";
import { AlgoTimeFrames, BFTTradeType, ChartData, InstrumentType, OrderViewBy, ParamNames } from "modules/Admin/data/tp-monitoring/TPMonitoringData";
import { Trade } from "modules/Admin/data/tp-monitoring/TPMonitoringDTO";
import { TPMonitoringService } from "modules/Admin/services/tp-monitoring.service";
import { DataTableViewMode } from "modules/datatable/viewmode";
import { TimeZone, TzUtils, UTCTimeZone } from "TimeZones";
import { IChartDataSet, TPChartSettings } from "../chart-components/single-parameter-chart/sp-chart.component.";
import { ChartDescriptor, StringDataSet, StringDSFixedColors } from "../tp-monitoring-general-data/tp-monitoring-general-data.component";

@Component({
    selector: 'tp-algo-trades-details',
    templateUrl: 'tp-monitoring-at-det.component.html',
    styleUrls: ['tp-monitoring-at-det.component.scss']
})
export class TPMonitoringAlgoTradesDetsComponent implements OnInit {

    constructor(private _tpMonitoringService: TPMonitoringService) { }

    ParamNames = ParamNames;
    ComparisonParamers: Array<ParamNames> = new Array<ParamNames>();    
    AlgoTimeFramesItems: Array<AlgoTimeFrames> = new Array<AlgoTimeFrames>();
    BFTTradeTypeItems: Array<BFTTradeType> = new Array<BFTTradeType>();
    InstrumentTypeItems: Array<InstrumentType> = new Array<InstrumentType>();
    OrderViewByItems: Array<OrderViewBy> = new Array<OrderViewBy>();

    SelectedComparing: ParamNames;
    SelectedTF: AlgoTimeFrames;
    SelectedMktType: InstrumentType;
    SelectedSetupType: BFTTradeType;
    SelectedViewBy: OrderViewBy;
    SelectedPlatform: string;    

    AllCharts: Array<ChartDescriptor> = new Array<ChartDescriptor>();
    Trades: Array<Trade> = new Array<Trade>();
    Total: number = 0;
    pageSizeTrades: number = 50;
    pageIndexTrades: number = 0;
    showSpinner: boolean;
    thousandNumber: number = 1;

    useDateRangeFilter: boolean;
    skipCanceledOrders: boolean = false;
    realAccountsOnly:  boolean = false;
    dtFrom: string = '';
    dtTo: string = '';

    ngOnInit(): void {
        this.ComparisonParamers = Object.values(ParamNames);
        this.AlgoTimeFramesItems = Object.values(AlgoTimeFrames);
        this.BFTTradeTypeItems = Object.values(BFTTradeType);
        this.InstrumentTypeItems = Object.values(InstrumentType);
        this.OrderViewByItems = Object.values(OrderViewBy);
        this.SelectedComparing = ParamNames.None;
        this.SelectedTF = AlgoTimeFrames.All;
        this.SelectedMktType = InstrumentType.All;
        this.SelectedSetupType = BFTTradeType.All;
        this.SelectedViewBy = OrderViewBy.Count;
        this.SelectedPlatform = "MT4";
    }

    handleComparingSelectionChange(change: any) {
        this.SelectedComparing = change.value;
    }

    handleMTPlatformSelectionChange(change: any) {
        this.SelectedPlatform = change.value;
    }

    handleTFSelectionChange(change: any) {
        this.SelectedTF = change.value;
    }

    handleInstrumentTypeSelectionChange(change: any) {
        this.SelectedMktType = change.value;
    }

    handleSetupTypeSelectionChange(change: any) {
        this.SelectedSetupType = change.value;
    }

    handleViewBySelectionChange(change: any) {
        this.SelectedViewBy = change.value;
    }

    handleBtnClick(): void {
        this.loadChartData();
    }

    handleNewPage(page: PageEvent): void {
        this.pageIndexTrades = page.pageIndex;
        this.loadTradesData();
    }

    handleUseDateRangeCheckedChanged(args: any) {
        this.useDateRangeFilter = args.checked;
        if (!this.useDateRangeFilter) {
            this.dtFrom = "";
            this.dtTo = "";
        }
    }

    handleSkipCanceledOrdersCheckedChanged(args: any) {
        this.skipCanceledOrders = args.checked;
    }

    handleRealAccountsOnlyCheckedChanged(args: any) {
        this.realAccountsOnly = args.checked;
    }

    dateFrom(): number {
        if (this.dtFrom) {
            return TzUtils.dateTimestamp(new Date(this.dtFrom), UTCTimeZone) / 1000;
        } else {
            return 0;
        }
    }

    dateTo(): number {
        if (this.dtTo) {
            let res = TzUtils.dateTimestamp(new Date(this.dtTo), UTCTimeZone) / 1000;
            if (res > 0) {
                res += 86400; // include dateTo day trades
            }
            return res;
        } else {
            return 0;
        }
    }

    loadOrdersBtnClick(): void {
        this.pageIndexTrades = 0;
        this.loadTradesData();
    }

    loadOrdersCSVBtnClick(): void {
        this.loadTradesDataCSV();
    }

    loadTradesData(): void {
        this.showSpinner = true;
        this._tpMonitoringService.getAlgoOrdersHistoryDetailed(this.pageSizeTrades, this.pageIndexTrades, this.SelectedPlatform,
            this.tfToSeconds(this.SelectedTF), this.SelectedSetupType, this.SelectedMktType,
            this.dateFrom(), this.dateTo(), this.skipCanceledOrders).subscribe(
                (trades: IPaginationResponse<Trade>) => {
                    if (trades) {
                        this.Trades = trades.items;
                        this.Total = trades.total;
                    }
                    this.showSpinner = false;
                });
    }

    loadTradesDataCSV(): void {
        this.showSpinner = true;
        this._tpMonitoringService.getAlgoOrdersHistoryDetailedCSV(this.thousandNumber, this.SelectedPlatform,
            this.tfToSeconds(this.SelectedTF), this.SelectedSetupType, this.SelectedMktType,
            this.dateFrom(), this.dateTo(), this.skipCanceledOrders)
            .subscribe((res: HttpResponse<Blob>) => {
                let fileName = res.headers.get("filename");
                let a = document.createElement("a");
                a.href = URL.createObjectURL(res.body);
                a.download = fileName;
                a.click();
                this.showSpinner = false;
            });
    }

    loadChartData(): void {
        this.showSpinner = true;
        
        let index = Object.values(ParamNames).indexOf(this.SelectedComparing);
        let selectedComparing = Object.keys(ParamNames)[index];

        index = Object.values(OrderViewBy).indexOf(this.SelectedViewBy);
        let selectedViewBy = Object.keys(OrderViewBy)[index];

        this._tpMonitoringService.getAlgoTradesCharts(selectedComparing,
            this.tfToSeconds(this.SelectedTF), this.SelectedSetupType, this.SelectedMktType,
            this.dateFrom(), this.dateTo(), this.skipCanceledOrders, selectedViewBy,
            this.realAccountsOnly)
            .subscribe((data: { [key: string]: { [key: string]: number } }) => {
                this.showSpinner = false;
                if (data) {
                    let chartNames = Object.keys(data);
                    let arr = new Array<ChartDescriptor>();

                    chartNames.forEach((item) => {
                        arr.push(new ChartDescriptor(
                            <TPChartSettings>{ chartHeader: item, chartType: "doughnutLabels", ratio: 1.2 },
                            <ChartData>{ DataSet: new StringDSFixedColors(data[item]) as IChartDataSet }
                        ));
                    });

                    this.AllCharts = new Array<ChartDescriptor>();
                    this.AllCharts = arr;
                }
            }, (error: any) => {
                this.showSpinner = false;
            });
    }

    private tfToSeconds(tf: AlgoTimeFrames): number {
        if (tf)
            switch (tf) {
                case AlgoTimeFrames.All:
                    return 0;
                case AlgoTimeFrames._15Min:
                    return 900;
                case AlgoTimeFrames._1Hour:
                    return 3600;
                case AlgoTimeFrames._4Hour:
                    return 14400;
                case AlgoTimeFrames._1Day:
                    return 86400;
            }
        return 0;
    }
}
