import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {TrendDirection} from "../../models/models";

@Component({
  selector: 'watchlist-chart',
  templateUrl: './watchlist-chart.component.html',
  styleUrls: ['./watchlist-chart.component.scss']
})
export class WatchlistChartComponent implements OnInit {
  cashedChartHistory: number[] = [];
  trendDirectionCashed: TrendDirection;

  historyDataChart;
  canvas: any;
  ctx: any;

  @ViewChild('instrumentPriceChart', {static: true}) public canvasElement: ElementRef;

  @Input() set chartHistory(prices: number[]) {
    this.cashedChartHistory = prices;
    this._setDataToChart(prices);
  }

  @Input() set trendDirection(trendDirection: TrendDirection) {
    if (trendDirection) {
      this.trendDirectionCashed = trendDirection;
      this._setCanvasTrendColor(trendDirection);
    }
  }

  constructor() { }

  ngOnInit() {
    this._createHistoryDataChart();
  }

  private _getGradientColor(trendDirection: TrendDirection): CanvasGradient {
    let gradient = this.canvas.getContext('2d').createLinearGradient(0, 100, 0, 0);
    gradient.addColorStop(1, (trendDirection === TrendDirection.Down) ? 'rgba(240, 38, 69, 0.2)' : 'rgba(39, 207, 109, 0.2)');
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    return gradient;
  }

  private _createHistoryDataChart() {
    this.canvas = this.canvasElement.nativeElement;
    this.ctx = this.canvas.getContext('2d');
    this.historyDataChart = new Chart(this.ctx, {
      type: 'line',
      data: {
        datasets: [{
          label: 'Total',
          borderColor: 'rgb(39, 207, 109)',
          backgroundColor: this._getGradientColor(TrendDirection.Up),
          lineTension: 0,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 0,
          data: []
        }]
      },
      options: {
        layout: {
          padding: {
            left: 1,
            right: 0,
            top: 0,
            bottom: -10
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0, // general animation time
        },
        events: [],
        hover: {
          animationDuration: 0, // duration of animations when hovering an item
        },
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
        tooltips: {
          enabled: false,
          displayColors: false,
        }
      },
    });
    this._setDataToChart(this.cashedChartHistory);
    this._setCanvasTrendColor(this.trendDirectionCashed);
  }

  private _setCanvasTrendColor(trendDirection: TrendDirection) {
    if (this.historyDataChart) {
      this.historyDataChart.data.datasets[0].borderColor = (trendDirection === TrendDirection.Down) ? 'rgb(240, 38, 69)' : 'rgb(39, 207, 109)';
      this.historyDataChart.data.datasets[0].backgroundColor = this._getGradientColor(trendDirection);
      this.historyDataChart.update();
    }
  }

  private _setDataToChart(prices: number[]) {
    if (this.historyDataChart) {
      if (!prices || !prices.length) {
        this.historyDataChart.data.labels = ['start', 'end'];
        this.historyDataChart.data.datasets[0].data = [0, 0];
      } else if (prices.length === 1) {
        this.historyDataChart.data.labels = ['start', 'end'];
        this.historyDataChart.data.datasets[0].data = [prices[0], prices[0]];
      } else {
        this.historyDataChart.data.labels = prices;
        this.historyDataChart.data.datasets[0].data = prices;
      }

      this.historyDataChart.update();
    }
  }

}
