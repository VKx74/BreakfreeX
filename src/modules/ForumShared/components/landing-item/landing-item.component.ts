import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'landing-item',
  templateUrl: './landing-item.component.html',
  styleUrls: ['./landing-item.component.scss']
})
export class LandingItemComponent implements OnInit {
  readonly format: string = 'MMMM, DD, HH:mm';
  @Input() borderBottom = true;
  @Input() noMarginBottom = false;
  @Input() noPadding = false;

  constructor() {
  }

  ngOnInit() {
  }
}
