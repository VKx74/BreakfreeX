import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ThemeService} from "@app/services/theme.service";
import {Theme} from "@app/enums/Theme";
import {ForumFacadeService} from "../../services/forum-facade.service";
import {takeUntil} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {MatSidenav} from "@angular/material/sidenav";
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router} from "@angular/router";


@Component({
    selector: 'root',
    templateUrl: './root.component.html',
    styleUrls: [
        './root.component.scss',
        '../../styles/_shared.scss'
    ]
})
export class RootComponent implements OnInit {
    @ViewChild('sidenav', {static: false}) sidenav: MatSidenav;
    @ViewChild('container', {static: false}) container: ElementRef;
    menuVisible: boolean = false;
    showProgressBar: boolean = false;

    constructor(private _themeService: ThemeService,
                private _facadeService: ForumFacadeService,
                private _router: Router,
                private _elRef: ElementRef) {
        // this._themeService.setActiveTheme(Theme.Landing);
    }

    ngOnInit() {
        this._router.events
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe((event: any) => {

                if (event instanceof NavigationStart) {
                    this.showProgressBar = true;
                }

                if (event instanceof NavigationEnd || event instanceof NavigationError || event instanceof NavigationCancel) {
                    this.showProgressBar = false;
                }

                if (event instanceof NavigationEnd) {
                    this._scrollToTop();
                }
            });
    }

    ngAfterViewInit() {
    }

    private _scrollToTop() {
        this.container.nativeElement.scrollTop = 0;
    }

    ngOnDestroy() {

    }
}
