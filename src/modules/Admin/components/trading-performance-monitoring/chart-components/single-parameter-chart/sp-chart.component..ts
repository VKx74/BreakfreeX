import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { ChartData, ChartDataArgs, Grouping, Periods } from "modules/Admin/data/tp-monitoring/TPMonitoringData";
import { TooltipDirective } from "modules/UI/directives/tooltip.directive";

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
        this.preInitChart();
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
                labels: ['a', 'b', 'c']
            },
            options: {
                showAllTooltips: true,
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
                        display: (this.chartType !== 'doughnut' && this.chartType !== 'doughnutLabels'),
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
                /* animation: {
                    duration: 1
                },
                onAnimationComplete: function () {
                    var self = this;
                    console.log('on animation complete');
                    var elementsArray = [];
                    Chart.helpers.each(self.data.datasets, function (dataset, datasetIndex) {
                        Chart.helpers.each(dataset.metaData, function (element, index) {                            
                            var tooltip = new Chart.Tooltrip({
                                _chart: self.chart,
                                _data: self.data,
                                _options: self.options,
                                _active: [element]
                            }, self);
                            console.log('tooltrip:');
                            console.log(tooltip);
                            tooltip.update();
                            tooltip.transition(Chart.helpers.easingEffects.linear).draw();
                        }, self);
                    }, self);
                } */
                // circumference: Math.PI,
                // rotation: 1.0 * Math.PI,
                // responsive: true,
                // legend: { position: 'top',},
                // title: { display: true, text: 'Graphics' },
                // animation: { animateScale: true, animateRotate: true }
            }
        });
        this.Chart.specArray = [];
    }

    private preInitChart(): void {
        Chart.defaults.doughnutLabels = Chart.helpers.clone(Chart.defaults.doughnut);
        let helpers = Chart.helpers;
        // let defaults = Chart.defaults;
        Chart.controllers.doughnutLabels = Chart.controllers.doughnut.extend({
            updateElement: function (arc, index, reset) {
                let _this = this;
                let chart = _this.chart,
                    chartArea = chart.chartArea,
                    opts = chart.options,
                    animationOpts = { animateScale: true, animateRotate: true },
                    arcOpts = opts.elements.arc,
                    centerX = (chartArea.left + chartArea.right) / 2,
                    centerY = (chartArea.top + chartArea.bottom) / 2,
                    startAngle = 0.5 * Math.PI, // non reset case handled later
                    endAngle = 2 * Math.PI, // non reset case handled later
                    dataset = _this.getDataset(),
                    circumference = reset && animationOpts.animateRotate ? 0 : arc.hidden ? 0 : _this.calculateCircumference(dataset.data[index]) * (2 * Math.PI / (2.0 * Math.PI)),
                    innerRadius = reset && animationOpts.animateScale ? 0 : _this.innerRadius,
                    outerRadius = reset && animationOpts.animateScale ? 0 : _this.outerRadius,
                    custom = arc.custom || {},
                    valueAtIndexOrDefault = helpers.getValueAtIndexOrDefault;

                helpers.extend(arc, {
                    // Utility
                    _datasetIndex: _this.index,
                    _index: index,

                    // Desired view properties
                    _model: {
                        x: centerX + chart.offsetX,
                        y: centerY + chart.offsetY,
                        startAngle: startAngle,
                        endAngle: endAngle,
                        circumference: circumference,
                        outerRadius: outerRadius,
                        innerRadius: innerRadius,
                        label: valueAtIndexOrDefault(dataset.label, index, chart.data.labels[index])
                    },

                    draw: function () {
                        let ctx = this._chart.ctx,
                            vm = this._view,
                            sA = vm.startAngle,
                            eA = vm.endAngle,
                            configoptios = this._chart.config.options;

                        let labelPos = this.tooltipPosition();
                        let segmentLabel = vm.circumference / configoptios.circumference * 100;

                        ctx.beginPath();

                        ctx.arc(vm.x, vm.y, vm.outerRadius, sA, eA);
                        ctx.arc(vm.x, vm.y, vm.innerRadius, eA, sA, true);

                        ctx.closePath();
                        ctx.strokeStyle = vm.borderColor;
                        ctx.lineWidth = vm.borderWidth;

                        ctx.fillStyle = vm.backgroundColor;

                        ctx.fill();
                        ctx.lineJoin = 'bevel';

                        if (vm.borderWidth) {
                            ctx.stroke();
                        }

                        if (vm.circumference > 0.0015) { // Trying to hide label when it doesn't fit in segment
                            ctx.beginPath();
                            ctx.font = helpers.fontString(configoptios.defaultFontSize, configoptios.defaultFontStyle, configoptios.defaultFontFamily);
                            ctx.fillStyle = "#190707";
                            ctx.textBaseline = "top";
                            ctx.textAlign = "center";

                            // Round percentage in a way that it always adds up to 100%
                            ctx.fillText(segmentLabel.toFixed(2) + "%", labelPos.x, labelPos.y);

                            // display in the center the total sum of all segments
                            // var total = dataset.data.reduce((sum, val) => sum + val, 0);
                            // ctx.fillText('Total = ' + total, vm.x, vm.y-20, 200);
                        }
                    }
                });

                let model = arc._model;
                model.backgroundColor = custom.backgroundColor ? custom.backgroundColor : valueAtIndexOrDefault(dataset.backgroundColor, index, arcOpts.backgroundColor);
                model.hoverBackgroundColor = custom.hoverBackgroundColor ? custom.hoverBackgroundColor : valueAtIndexOrDefault(dataset.hoverBackgroundColor, index, arcOpts.hoverBackgroundColor);
                model.borderWidth = custom.borderWidth ? custom.borderWidth : valueAtIndexOrDefault(dataset.borderWidth, index, arcOpts.borderWidth);
                model.borderColor = custom.borderColor ? custom.borderColor : valueAtIndexOrDefault(dataset.borderColor, index, arcOpts.borderColor);

                // Set correct angles if not resetting
                if (!reset || !animationOpts.animateRotate) {
                    if (index === 0) {
                        model.startAngle = opts.rotation;
                    } else {
                        model.startAngle = _this.getMeta().data[index - 1]._model.endAngle;
                    }

                    model.endAngle = model.startAngle + model.circumference;
                }

                arc.pivot();
            }
        });
    }
}