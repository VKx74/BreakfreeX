import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {PaginationHandler} from "@app/models/pagination.model";
import {ComponentIdentifier} from "@app/models/app-config";

@Component({
  selector: 'pagination-table-container',
  templateUrl: './pagination-table-container.component.html',
  styleUrls: ['./pagination-table-container.component.scss']
})
export class PaginationTableContainerComponent implements OnInit {
  @Input() paginationHandler: PaginationHandler;
  @Input() loading = false;
  @Input() noItems = false;
  @Input() title: string;
  @Input() noItemsPlaceholderText = 'No Items';
  @Input() componentIdentifier: ComponentIdentifier;
  @ViewChild('header_left', {static: true}) headerLeft: ElementRef<HTMLDivElement>;
  @ViewChild('filters', {static: true}) filters: ElementRef<HTMLDivElement>;

  get isFiltersPassed(): boolean {
    return this.filters && !!this.filters.nativeElement.innerHTML.trim();
  }

  get isLeftHeaderLeftPassed(): boolean {
    return this.headerLeft && !!this.headerLeft.nativeElement.innerHTML.trim();
  }

  constructor() { }

  ngOnInit() {
  }

}
