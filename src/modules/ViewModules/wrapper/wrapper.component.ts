import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {ApplicationType} from "@app/enums/ApplicationType";
import {Observable} from "rxjs";
import {Router} from "@angular/router";
import {ScriptingPageRoutes} from "../../scripting-page/scripting-page.routes";

export interface INavLinkTabDescriptor {
    name: string;
    url: string;
    disabled?: Observable<boolean>;
}

@Component({
    selector: 'wrapper',
    templateUrl: './wrapper.component.html',
    styleUrls: ['./wrapper.component.scss']
})
export class WrapperComponent implements OnInit {
    @Input() fluid = false;
    @Input() tabs: INavLinkTabDescriptor[] = [];
    @HostBinding('@.disabled') disabled = true;

    get applicationType() {
        return ApplicationType;
    }

    constructor(public router: Router) {
    }


    ngOnInit() {
    }

}
