import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { BrokerService } from "@app/services/broker.service";
import { TradingPerformanceService } from "modules/BreakfreeTrading/services/tradingPerformance.service";

@Component({
    selector: 'plainchart',
    templateUrl: 'plainChart.component.html',
    styleUrls: ['plainChart.component.scss']
})
export class PlainChartComponent implements OnInit{    
    @ViewChild ('theCanvas',{static:true}) theCanvas:ElementRef
    Chart:any;

    constructor(private _tradingPerformanceService: TradingPerformanceService,
        private _brokerService:BrokerService){}
    
    public showSpinner:boolean;

    ngOnInit(): void {        
        this.initChart();
        let activeBroker = this._brokerService.getActiveBroker();
        if(activeBroker) {
            this.showSpinner = true;
            this._tradingPerformanceService.getWeeklyPnLHistory(activeBroker.account, activeBroker.brokerType)
            .subscribe((result:any)=>{
                var res = result as {[key: number]: number};
                if (res){                   
                    this.addChartData(res);
                }
                this.showSpinner = false;
            }, (error:any)=>{
                this.showSpinner = false;
            });
        }
    }

    private addChartData(chartData: {[key: number]: number}){
        let lastVal = 0;
        let keys = Object.keys(chartData);        
        keys.forEach((key) => {
            this.Chart.data.datasets[0].data.push(chartData[key]);            
            this.Chart.data.labels.push('');
            this.Chart.specArray.push(key);
            lastVal = chartData[key];            
        });        
        if (lastVal < 0){
            this.Chart.data.datasets[0].borderColor = 'red';
            this.Chart.data.datasets[0].pointBackgroundColor = 'red';
        } else {
            this.Chart.data.datasets[0].borderColor = 'green';
            this.Chart.data.datasets[0].pointBackgroundColor = 'green';
        }
        this.Chart.update();
    }

    private initChart():void{
        this.Chart = new Chart(this.theCanvas.nativeElement.getContext('2d'), {            
            type: 'line', 
            data: {
                datasets: [{
                    borderColor: "#80b6f4",                    
                    pointBackgroundColor: "#80b6f4",                    
                    fill: false,                  
                    data: [],                    
                }],
                labels:[]
            },
            options: {                
                aspectRatio:3,
                tooltips: {
                    position:'nearest',
                    backgroundColor: 'rgba(125,125,125,0.8)',
                    displayColors: false,
                    callbacks: {
                        label: function(tooltipItem, data) {
                            let dateUnix = this._chart.specArray[tooltipItem.index];
                            let date = new Date(dateUnix * 1000);
                            return `${date.toLocaleDateString()}: ${tooltipItem.yLabel} %`; 
                        }
                    }
                },
                legend: {
                    display: false,                 
                },
                scales: {
                    yAxes:[{
                        gridLines:{
                            display:false
                        },
                        ticks: {
                            padding: 2,
                            fontColor: "rgba(0,0,0,0.5)",
                            fontStyle: "bold",
                            fontSize: 8
                        }
                    }],
                    xAxes:[{
                        display: false,
                        gridLines:{
                            display:false
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