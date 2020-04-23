import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'trend-indicator',
  templateUrl: './trend-indicator.component.html',
  styleUrls: ['./trend-indicator.component.scss']
})
export class TrendIndicatorComponent implements OnInit {
  @Input() trendData: Array<boolean|object>;

  constructor() { }

  ngOnInit() {
  }

}
