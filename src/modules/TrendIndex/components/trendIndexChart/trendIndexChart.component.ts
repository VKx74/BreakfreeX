import { Component, Injector, Inject, ViewChild, Input, ElementRef } from '@angular/core';
import { ETrendIndexStrength } from '../trendIndex/trendIndex.component';

export interface ITrendIndexChartData {
    dates: string[];
    values: number[];
}

@Component({
    selector: 'trend-index-chart',
    templateUrl: './trendIndexChart.component.html',
    styleUrls: ['./trendIndexChart.component.scss']
})
export class TrendIndexChartComponent {
    historyDataChart: Chart;
    canvas: any;
    ctx: any;

    @ViewChild('trendIndexChart', { static: true }) public canvasElement: ElementRef;
    private _data: ITrendIndexChartData;
    private _height: number = 100;

    @Input() public set data(value: ITrendIndexChartData) {
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
                    label: 'Positive',
                    borderColor: 'rgba(184, 233, 163, 0.8)',
                    backgroundColor: 'rgba(184, 233, 163, 0.5)',
                    lineTension: 0,
                    borderWidth: 1,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    data: this._data.values.map((_) => {
                        return _ > 0 ? _ : null;
                    })
                }, {
                    label: 'Negative',
                    borderColor: 'rgba(255, 182, 182, 0.8)',
                    backgroundColor: 'rgba(255, 182, 182, 0.5)',
                    lineTension: 0,
                    borderWidth: 1,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    data: this._data.values.map((_) => {
                        return _ < 0 ? Math.abs(_) : null;
                    })
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

    ngOnDestroy() {
        this._destroy();
    }

    private _setDataToChart() {
        if (this.historyDataChart && this._data) {
            this.historyDataChart.data.labels = this._data.dates;

            this.historyDataChart.data.datasets[0].data = this._data.values.map((_) => {
                return _ > 0 ? _ : null;
            });
            this.historyDataChart.data.datasets[0].borderColor = 'rgba(184, 233, 163, 0.8)';
            this.historyDataChart.data.datasets[0].backgroundColor = 'rgba(184, 233, 163, 0.5)';

            this.historyDataChart.data.datasets[1].data = this._data.values.map((_) => {
                return _ < 0 ? Math.abs(_) : null;
            });
            this.historyDataChart.data.datasets[1].borderColor = 'rgba(255, 182, 182, 0.8)';
            this.historyDataChart.data.datasets[1].backgroundColor = 'rgba(255, 182, 182, 0.5)';

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

