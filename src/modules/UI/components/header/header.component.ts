import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() noMaxHeight = false;
  @Input() noPadding = false;
  @Input() noBottomMargin = false;
  @Input() paginationButtons = false;
  @Output() previousClick = new EventEmitter<never>();
  @Output() nextClick = new EventEmitter<never>();

  constructor() { }

  ngOnInit() {
  }
}
