import { Component, OnInit } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {SettingsTranslateService} from "../../../broker/localization/token";

@Component({
  selector: 'buy-app',
  templateUrl: './buy-app.component.html',
  styleUrls: ['./buy-app.component.scss'],
  providers: [
    {
      provide: TranslateService,
      useExisting: SettingsTranslateService,
    },
  ]
})
export class BuyAppComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
