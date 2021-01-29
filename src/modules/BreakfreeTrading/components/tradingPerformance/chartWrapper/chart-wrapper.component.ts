import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { first } from "rxjs/operators";
import { AST_This } from "terser";
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
        /* console.log('chartSettings:');
        console.log(chartSettings);
        this._chartSettings = chartSettings;
        this.updateChartSettings(); */        
        if (!this.Chart) {
            this._chartSettings = chartSettings;
            this.initChart();
            this.Header = `${this._chartSettings.header}(${this._chartSettings.unit})`;
            // console.log('header:');
            // console.log(this.Header);
        }
    }

    @Input() set ChartData(chartData: {[key: number]: number}) {
        this._chartData = chartData;
        this.updateChartData();
    }
    
    ngOnInit(): void {
        // this.initChart();
        // this.updateChartSettings();
        this.updateChartData();
    }

    /*private updateChartSettings(): void {        
        if (this.Chart && this._chartSettings){
            console.log('uppdate chart settings:');
            this.Chart.type = this._chartSettings.chartType;
            console.log(this.Chart.type);
            console.log('^ chart type');
            this.Chart.update();
        }
    }*/

    private updateChartData(): void {
        if (this.Chart && this._chartSettings) {
            this.addChartData(this._chartData);           
        }
    }

    private addChartData(chartData: {[key: number]: number}) {
        console.log('Add chart Data');
        let firstVal = 0;
        let lastVal = 0;
        let keys = Object.keys(chartData);        
        this.Chart.data.datasets[0].data = [];
        this.Chart.data.labels = [];
        this.Chart.data.datasets[0].backgroundColor = [];
        this.Chart.specArray = [];
        this.Chart.unit = this._chartSettings.unit;
        this.Header = `${this._chartSettings.header}(${this._chartSettings.unit})`;
        // let maxVal = Number.NEGATIVE_INFINITY;
        // let minVal = Number.POSITIVE_INFINITY;
        keys.forEach((key) => {            
            this.Chart.data.datasets[0].data.push(chartData[key]);            
            this.Chart.data.labels.push(this.screateLabel(parseInt(key, 10)));
            this.Chart.specArray.push(key);
            lastVal = chartData[key];
            /* if(lastVal > maxVal)
                maxVal = lastVal;
            if(lastVal < minVal)
                minVal = lastVal;
                */
            if (!firstVal)
                firstVal = chartData[key];
            if (lastVal < 0) {
                this.Chart.data.datasets[0].backgroundColor.push('red');
            } else {
                this.Chart.data.datasets[0].backgroundColor.push('green');
            }
        });
        // maxVal*=1.1;
        // minVal*=1.1;
        // this.Chart.options.scales.yAxes[0].ticks.stepSize = (maxVal - minVal) / 4;

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
                            // let dateUnix = this._chart.specArray[tooltipItem.index];
                            // let date = new Date(dateUnix * 1000);                            
                            // return `${date.toLocaleDateString()}: ${tooltipItem.yLabel} ${this._chart.unit}`;
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
                            // stepSize: 1000                            
                        }
                    }],
                    xAxes: [{
                        // display: true,
                        gridLines: {
                            display: false,
                            /*zeroLineColor: "rgba(0,0,0,0)",
                            drawBorder: false*/
                        },                       
                    }]
                }
            }
        });
        this.Chart.specArray = [];
        this.Chart.unit = [];
    }
}