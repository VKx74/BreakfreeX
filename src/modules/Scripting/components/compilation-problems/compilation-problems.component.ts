import {Component, Input, OnInit} from '@angular/core';
import {JsUtil} from "../../../../utils/jsUtil";
import {CompilationStatus} from "@scripting/models";
import {COMPILE_STATUS} from "@scripting/models/enums";

@Component({
    selector: 'compilation-problems',
    templateUrl: './compilation-problems.component.html',
    styleUrls: ['./compilation-problems.component.scss']
})
export class CompilationProblemsComponent implements OnInit {
    @Input() compilationResult: CompilationStatus;
    showProblemsDetails: boolean = false;

    constructor() {
    }

    ngOnInit() {
    }

    compilationStatusLocKey(status: COMPILE_STATUS): string {
        return `compilationStatus.${JsUtil.stringEnumNameByValue(COMPILE_STATUS, status)}`;
    }

    toggleShowProblemsDetails() {
        this.showProblemsDetails = !this.showProblemsDetails;
    }
}
