import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {Router} from "@angular/router";

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

    constructor(public router: Router) {
    }


    ngOnInit() {
    }

}
