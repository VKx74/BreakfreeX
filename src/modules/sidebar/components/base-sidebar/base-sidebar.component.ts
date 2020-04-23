import {Component, Input, OnInit} from '@angular/core';
import {SidebarService} from "@app/services/sidebar.service";
import {LoaderService} from "@app/services/loader.service";
import {NavigationEnd, NavigationStart, Router} from "@angular/router";
import {filter} from "rxjs/operators";

@Component({
    selector: 'base-sidebar',
    templateUrl: './base-sidebar.component.html',
    styleUrls: ['./base-sidebar.component.scss']
})
export class BaseSidebarComponent implements OnInit {
    loading$ = this._loaderService.loading$;
    @Input() contentPaddingTop = 0;

    get sidebarOpen() {
        return this._sidebarService.shown;
    }

    constructor(private _sidebarService: SidebarService,
                private _loaderService: LoaderService,
                private _router: Router) {

    }

    ngOnInit() {
        // this._router.events
        //     .pipe()
        //     .subscribe(e => {
        //     if (e instanceof NavigationStart) {
        //         this._loaderService.show();
        //     } else if (e instanceof NavigationEnd) {
        //         this._loaderService.hide();
        //     }
        // });
    }

    setSidebarState(state: boolean) {
        this._sidebarService.setSidebarState(state);
    }
}
