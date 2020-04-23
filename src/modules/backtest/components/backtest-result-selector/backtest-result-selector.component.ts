import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ScriptResultDTO} from "../../../Scripting/models/dtos";
import {map, switchMap} from "rxjs/operators";
import {of} from "rxjs";
import {Script} from "../../../Scripting/models/Script";

@Component({
    selector: 'backtest-result-selector',
    templateUrl: './backtest-result-selector.component.html',
    styleUrls: ['./backtest-result-selector.component.scss']
})
export class BacktestResultSelectorComponent implements OnInit {
    scripts: Script[] = [];
    selectedScript: Script;
    results: ScriptResultDTO[] = [];
    selectedResult: ScriptResultDTO;
    @Output() onResultSelected = new EventEmitter<ScriptResultDTO>();

    optionCaption = (script: Script) => of(script.name);

    constructor() {
    }

    ngOnInit() {
    }

    handleScriptSelected(script: Script) {
    }

    handleBacktestResultSelected(result: ScriptResultDTO) {
        this.selectedResult = result;
        this.onResultSelected.emit(result);
    }

    handleRemoveBacktestResult(result: ScriptResultDTO) {
    }
}
