import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { ChartData, ChartDataArgs, Grouping, Periods } from "modules/Admin/data/tp-monitoring/TPMonitoringData";

export class TPChartSettings {
    public chartType: string;
    public chartHeader: string;
    public showPeriodOption: boolean;
    public showGroupOption: boolean;
    public updateOnPeriodChange: boolean;
    public ratio: number;
}

export interface IChartDataSet {
    getLabels(): Array<string>;
    getKeys(): Array<string>;
    getValues(): Array<number>;
    getToolTips(): Array<Array<string>>;
    getColors(): Array<string>;
    getPointColor(): string;
}

@Component({
    selector: 'sp-chart',
    templateUrl: 'sp-chart.component.html',
    styleUrls: ['sp-chart.component.scss']
})
export class SPChartComponent implements OnInit {
    chartData: { [key: number]: number };
    chartDataStr: { [key: string]: number };
    dataSet: IChartDataSet;
    showSpinner: boolean;
    showUpdateButton: boolean;

    @ViewChild('theCanvas', { static: true }) theCanvas: ElementRef;
    @Input() set ChartSettings(chartSettings: TPChartSettings) {
        if (chartSettings) {
            this.ChartHeader = chartSettings.chartHeader;
            this.chartType = chartSettings.chartType;
            this.chartRatio = chartSettings.ratio;
            if (this.Chart)
                this.Chart.type = this.chartType;
            this.showPeriodOption = chartSettings.showPeriodOption;
            this.showGroupOption = chartSettings.showGroupOption;
            this.updateOnPeriodChange = chartSettings.updateOnPeriodChange;

            let counter = 0;
            if (this.showPeriodOption) counter++;
            if (this.showGroupOption) counter++;

            if (counter > 1)
                this.showUpdateButton = true;
        }
    }

    @Input() set Data(chartData: ChartData) {
        this.showSpinner = false;
        if (chartData) {
            this.SelectedPeriod = Periods[chartData.Period];
            this.SelectedGrouping = Grouping[chartData.Grouping];
            this.addChartDataSet(chartData.DataSet);
        } else {
            this.Chart.data.datasets[0].data = [];
            this.Chart.update();
        }
    }

    @Input() set DetailParams(detailParams: any) {

    }

    @Output() needUpdate = new EventEmitter<ChartDataArgs>();

    Chart: any;
    chartType: string;
    chartRatio: number;
    showPeriodOption: boolean;
    showGroupOption: boolean;
    updateOnPeriodChange: boolean;

    ChartHeader: string;
    PeriodOptions: Array<Periods> = new Array<Periods>();
    GroupingOptions: Array<string> = new Array<string>();

    SelectedPeriod: Periods = Periods.Last90Days;
    SelectedGrouping: Grouping;

    public showOptions: boolean = false;

    ngOnInit() {
        this.initChart();
        if (this.chartType) {
            this.Chart.type = this.chartType;
        }

        if (this.chartRatio) {
            this.Chart.options.aspectRatio = this.chartRatio;
        }

        this.PeriodOptions = Object.values(Periods);
        this.GroupingOptions = Object.values(Grouping);

        if (this.dataSet) {
            this.addChartDataSet(this.dataSet);
        }
    }

    update(): void {
        this._emitNeedUpdate();
    }

    handlePeriodSelectionChange(change: any) {
        if (!change)
            return;

        this.SelectedPeriod = change.value;
        if (this.updateOnPeriodChange) {
            this._emitNeedUpdate();
        }
    }

    _emitNeedUpdate(): void {
        this.showSpinner = true;
        this.needUpdate.emit(<ChartDataArgs>{
            Period: this.SelectedPeriod,
            Grouping: this.SelectedGrouping
        });
    }

    handleGroupingSelectionChange(change: any) {
        this.SelectedGrouping = change.value;
    }

    private addChartDataSet(dataSet: IChartDataSet) {
        if (!this.Chart) {
            this.dataSet = dataSet;
            return;
        }

        if (!dataSet) {
            this.Chart.data.datasets[0].data = [];
            this.Chart.update();
            return;
        }

        this.Chart.data.datasets[0].data = dataSet.getValues();
        this.Chart.data.labels = dataSet.getLabels();
        this.Chart.specArray = dataSet.getToolTips();
        this.Chart.data.datasets[0].backgroundColor = dataSet.getColors();
        let pointColor = dataSet.getPointColor();
        this.Chart.data.datasets[0].borderColor = pointColor;
        this.Chart.data.datasets[0].pointBackgroundColor = pointColor;

        this.Chart.update();
    }

    private initChart(): void {
        this.Chart = new Chart(this.theCanvas.nativeElement.getContext('2d'), {
            type: this.chartType,
            data: {
                datasets: [{
                    borderWidth: 0,
                    borderColor: "#80b6f4",
                    pointBackgroundColor: "#80b6f4",
                    fill: false,
                    data: [],
                }],
                labels: []
            },
            options: {
                aspectRatio: this.chartRatio,
                tooltips: {
                    position: 'nearest',
                    backgroundColor: 'rgba(125,125,125,0.8)',
                    displayColors: false,
                    callbacks: {
                        label: function (tooltipItem, data) {
                            return this._chart.specArray[tooltipItem.index];
                        },
                        title: function (tooltipItems, object) {
                            return null;
                        }
                    }
                },
                legend: {
                    display: false,
                },
                scales: {
                    yAxes: [{
                        display: this.chartType !== 'doughnut',
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            padding: 2,
                            fontColor: "rgba(0,0,0,0.5)",
                            fontStyle: "bold",
                            fontSize: 8
                        }
                    }],
                    xAxes: [{
                        display: false,
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            padding: 0,
                        }
                    }]
                }                
            }
        });
        this.Chart.specArray = [];        
    }
}