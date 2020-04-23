import {Component, ContentChild, OnInit, TemplateRef} from '@angular/core';
import {HeaderComponent} from "../../../UI/components/header/header.component";

@Component({
  selector: 'table-wrapper',
  templateUrl: './table-wrapper.component.html',
  styleUrls: ['./table-wrapper.component.scss']
})
export class TableWrapperComponent implements OnInit {
  @ContentChild(HeaderComponent, {static: false}) headerComponent: HeaderComponent;

  get isHeaderPassed() {
    console.log('header', this.headerComponent);
    return !!this.headerComponent;
  }

  constructor() { }

  ngOnInit() {
  }

}
