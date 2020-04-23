import { Component, OnInit } from '@angular/core';
import {ScriptingPageRoutes} from "../../scripting-page.routes";
import {TranslateService} from "@ngx-translate/core";
import {SettingsTranslateService} from "../../../broker/localization/token";
import {ScriptsTranslateService} from "@scripting/localization/token";
import {Router} from "@angular/router";



@Component({
  selector: 'scripting-page',
  templateUrl: './scripting-page.component.html',
  styleUrls: ['./scripting-page.component.scss'],
  providers: [
{
    provide: TranslateService,
    useExisting: ScriptsTranslateService
}
]
})


export class ScriptingPageComponent implements OnInit {
    tabs = [
        {
            name: 'scriptsManager.scriptsManager',
            url: ScriptingPageRoutes.ScriptingManager
        },
        {
            name: 'runningScripts',
            url: ScriptingPageRoutes.RunningScripts
        },
        {
            name: 'backtesting',
            url: ScriptingPageRoutes.Backtest
        },
    ];

  constructor() { }

  ngOnInit() {
  }

}
