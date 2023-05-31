import { Component, Injector, Inject, ViewChild, Input, ElementRef } from '@angular/core';
import { ETrendIndexStrength } from '../trendIndex/trendIndex.component';

export interface ITrendIndexBarChartData {
    dates: string[];
    values: number[];
    isUpTrending: boolean;
}

@Component({
    selector: 'trend-index-bar-chart',
    templateUrl: './trendIndexBarChart.component.html',
    styleUrls: ['./trendIndexBarChart.component.scss']
})
export class TrendIndexBarChartComponent {
    historyDataChart: Chart;
    canvas: any;
    ctx: any;

    @ViewChild('trendIndexBarChart', { static: true }) public canvasElement: ElementRef;
    private _data: ITrendIndexBarChartData;
    private _height: number = 100;

    @Input() public set data(value: ITrendIndexBarChartData) {
        this._data = value;
        this._setDataToChart();
    }

    @Input() public set height(value: number) {
        this._height = value;
    }

    constructor() {
    }

    ngAfterViewInit() {
        this._createChart();
    }

    private _createChart() {
        this.canvas = this.canvasElement.nativeElement;
        this.canvas.height = this._height;
        this.ctx = this.canvas.getContext('2d');
        this.historyDataChart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels: this._data.dates,
                datasets: [{
                    label: 'Price',
                    borderColor: !this._data.isUpTrending ? 'rgba(189, 91, 106, 0.8)' : 'rgba(94, 175, 128, 0.8)',
                    backgroundColor: this._getGradientColor(),
                    lineTension: 0,
                    borderWidth: 1,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    data: this._data.values
                }]
            },
            options: {
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        top: 0,
                        bottom: 0
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 500, // general animation time
                },
                // events: [],
                // hover: {
                //     animationDuration: 1000, // duration of animations when hovering an item
                // },
                responsiveAnimationDuration: 0, // animation duration after a resize
                scales: {
                    xAxes: [{
                        gridLines: {
                            display: false,
                            drawBorder: false,
                        },
                        ticks: {
                            display: false,
                        },
                    }],
                    yAxes: [{
                        display: false,
                        gridLines: {
                            display: false,
                            drawBorder: false,
                        },
                        ticks: {}
                    }]
                },
                legend: {
                    display: false
                },
                // tooltips: {
                //     enabled: true,
                //     // displayColors: false,
                // }
            },
        });
    }

    private _getGradientColor(): CanvasGradient {
        let gradient = this.canvas.getContext('2d').createLinearGradient(0, 100, 0, 0);
        gradient.addColorStop(1, !this._data.isUpTrending ? 'rgba(189, 91, 106, 0.5)' : 'rgba(94, 175, 128, 0.5)');
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        return gradient;
    }

    ngOnDestroy() {
        this._destroy();
    }

    private _setDataToChart() {
        if (this.historyDataChart && this._data) {
            this.historyDataChart.data.labels = this._data.dates;
            this.historyDataChart.data.datasets[0].data = this._data.values;
            this.historyDataChart.data.datasets[0].borderColor = !this._data.isUpTrending ? 'rgba(189, 91, 106, 0.8)' : 'rgba(94, 175, 128, 0.8)';
            this.historyDataChart.data.datasets[0].backgroundColor = this._getGradientColor();

            this.historyDataChart.update();
        }
    }

    private _destroy() {
        if (this.historyDataChart) {
            this.historyDataChart.destroy();
            this.historyDataChart = null;
            console.log(">>> Chart destroyed");
        }
    }
}

