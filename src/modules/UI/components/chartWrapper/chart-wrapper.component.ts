import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { ChartWrapperSettings } from "../../../BreakfreeTrading/components/tradingPerformance/model/ChartWrapperSettings";

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
                this.Chart.data.datasets[0].backgroundColor.push('#6E260E');
            } else {
                this.Chart.data.datasets[0].backgroundColor.push('#4fd54a');
            }
        });

        if (firstVal > lastVal ) {
            this.Chart.data.datasets[0].borderColor = '#6E260E';
            this.Chart.data.datasets[0].pointBackgroundColor = '#6E260E';            
        } else {
            this.Chart.data.datasets[0].borderColor = '#4fd54a';
            this.Chart.data.datasets[0].pointBackgroundColor = '#4fd54a';            
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
                responsive: true,
                maintainAspectRatio: false,

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
                        position: 'left',
                        gridLines: {
                            display: false,
                            color: "rgba(255,255,255,0.77)",
                            lineWidth: 0,
                            drawBorder: true                            
                        },
                        ticks: {
                            padding: 0,
                            fontSize: 12,
                            maxTicksLimit: 4,
                            fontColor: 'rgba(255,255,255,0.77'                        
                        }
                    }],
                    xAxes: [{

                        barPercentage: 0.23,       // You can adjust this for your preference
                        categoryPercentage: 0.7,  // You can adjust this for your preference
                        maxBarThickness: 50,       // Set your desired max width for bars here
            
                        // display: true,
                        gridLines: {
                            display: false,
                            color: "rgba(255,255,255,0.77",
                            lineWidth: 0,
                            drawBorder: true                            
                        },
                        ticks: {
                            padding: 0,
                            fontSize: 11,
                            maxTicksLimit: 14,
                            fontColor: 'rgba(255,255,255,0.77)'                                  
                        }
                                               
                    }]
                }
            }
        });
        this.Chart.specArray = [];
        this.Chart.unit = [];
    }
}