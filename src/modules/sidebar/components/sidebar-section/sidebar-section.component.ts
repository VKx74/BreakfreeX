import {Component, ContentChild, Input, OnInit} from '@angular/core';

export interface SidebarSectionItem {
  iconClass: string;
  label: string;
  link: string;
}

@Component({
  selector: 'sidebar-section',
  templateUrl: './sidebar-section.component.html',
  styleUrls: ['./sidebar-section.component.scss']
})
export class SidebarSectionComponent implements OnInit {
  @Input() label: string;
  @Input() noPadding = false;
  @Input() items: SidebarSectionItem[] = [];
  @Input() hideBorder = false;

  constructor() { }

  ngOnInit() {
  }

}
