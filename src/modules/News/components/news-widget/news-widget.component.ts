import {Component, Injector, OnInit} from '@angular/core';
import {BaseLayoutItemComponent} from "@layout/base-layout-item.component";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'news-widget',
  templateUrl: './news-widget.component.html',
  styleUrls: ['./news-widget.component.scss']
})
export class NewsWidgetComponent extends BaseLayoutItemComponent implements OnInit {

  constructor(public injector: Injector,
              private _translateService: TranslateService) {
    super(injector);
    super.setTitle(this._translateService.stream('news'));
  }

  ngOnInit() {
  }

  protected getComponentState(): any {
  }

}
