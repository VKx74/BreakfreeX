import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'nav-section',
  templateUrl: './nav-section.component.html',
  styleUrls: ['./nav-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavSectionComponent implements OnInit {
  @Input() rightBorder = false;
  @Input() leftBorder = false;
  @Input() paddingLeft = true;
  @Input() paddingRight = true;

  constructor() { }

  ngOnInit() {
  }

}
