import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { ChartWrapperSettings } from "../model/ChartWrapperSettings";

@Component({
    selector: 'chart-wrapper',
    templateUrl: 'chart-wrapper.component.html',
    styleUrls: ['chart-wrapper.component.scss']
})
export class ChartWrapperComponent implements OnInit {    
    @ViewChild ('theCanvas', {static: true}) theCanvas: ElementRef;
    Chart: any;
    private _chartSettings: ChartWrapperSettings;
    private _chartData: {[key: number]: number};

    public Header: string;

    @Input() set ChartSettings(chartSettings: ChartWrapperSettings) {        
        if (!this.Chart) {
            this._chartSettings = chartSettings;
            this.initChart();
            this.Header = `${this._chartSettings.header}(${this._chartSettings.unit})`;            
        }
    }

    @Input() set ChartData(chartData: {[key: number]: number}) {
        this._chartData = chartData;
        this.updateChartData();
    }
    
    ngOnInit(): void {        
        this.updateChartData();
    }

    private updateChartData(): void {
        if (this.Chart && this._chartSettings) {
            this.addChartData(this._chartData);           
        }
    }

    private addChartData(chartData: {[key: number]: number}) {        
        let firstVal = 0;
        let lastVal = 0;
        let keys = Object.keys(chartData);        
        this.Chart.data.datasets[0].data = [];
        this.Chart.data.labels = [];
        this.Chart.data.datasets[0].backgroundColor = [];
        this.Chart.specArray = [];
        this.Chart.unit = this._chartSettings.unit;
        this.Header = `${this._chartSettings.header}(${this._chartSettings.unit})`;        
        keys.forEach((key) => {            
            this.Chart.data.datasets[0].data.push(chartData[key]);            
            this.Chart.data.labels.push(this.screateLabel(parseInt(key, 10)));
            this.Chart.specArray.push(key);
            lastVal = chartData[key];            
            if (!firstVal)
                firstVal = chartData[key];
            if (lastVal < 0) {
                this.Chart.data.datasets[0].backgroundColor.push('red');
            } else {
                this.Chart.data.datasets[0].backgroundColor.push('green');
            }
        });

        if (firstVal > lastVal ) {
            this.Chart.data.datasets[0].borderColor = 'red';
            this.Chart.data.datasets[0].pointBackgroundColor = 'red';            
        } else {
            this.Chart.data.datasets[0].borderColor = 'green';
            this.Chart.data.datasets[0].pointBackgroundColor = 'green';            
        }
        
        this.Chart.update();
    }

    private screateLabel(dateUnix: number): string {
        let date = new Date(dateUnix * 1000);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }    

    private initChart(): void {
        this.Chart = new Chart(this.theCanvas.nativeElement.getContext('2d'), {            
            type: this._chartSettings.chartType,
            data: {
                datasets: [{
                    borderColor: "#80b6f4",                    
                    pointBackgroundColor: "#80b6f4",                    
                    fill: false,                  
                    data: [],                    
                }],
                labels: []
            },
            options: {                
                aspectRatio: 3,
                tooltips: {
                    position: 'nearest',
                    backgroundColor: 'rgba(125,125,125,0.8)',                    
                    displayColors: false,
                    callbacks: {
                        label: function(tooltipItem, data) {                            
                            return `${tooltipItem.yLabel} ${this._chart.unit}`;
                        }
                    }
                },
                legend: {
                    display: false,                 
                },
                scales: {
                    yAxes: [{
                        gridLines: {
                            color: "rgba(50,50,50,0.1)",
                            drawBorder: false                            
                        },
                        ticks: {
                            padding: 2,
                            fontColor: "rgba(0,0,0,0.5)",                            
                            fontStyle: "bold",
                            fontSize: 10,
                            maxTicksLimit: 4                            
                        }
                    }],
                    xAxes: [{
                        // display: true,
                        gridLines: {
                            display: false,                            
                        },                       
                    }]
                }
            }
        });
        this.Chart.specArray = [];
        this.Chart.unit = [];
    }
}