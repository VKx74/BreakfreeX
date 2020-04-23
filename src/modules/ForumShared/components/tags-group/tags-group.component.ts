import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IUserTag} from "@app/services/component-access.service";
import {Observable, of} from "rxjs";

export type ITagTitleProvider = (tag: any) => Observable<string>;

@Component({
  selector: 'tags-group',
  templateUrl: './tags-group.component.html',
  styleUrls: ['./tags-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagsGroupComponent implements OnInit {
  @Input() tagMaxWidth = 80;
  @Input() tagsSpace = 5;
  @Input() tags: any[];
  @Output() tagClick = new EventEmitter<IUserTag>();
  @Input() tagTitle: ITagTitleProvider = (tag) => of(tag.name);

  constructor() { }

  ngOnInit() {
  }

  onTagClick(tag: IUserTag) {
    this.tagClick.emit(tag);
  }

}
