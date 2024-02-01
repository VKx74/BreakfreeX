import {Component, OnDestroy, AfterViewInit} from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import {ThemeService} from "@app/services/theme.service";
import { AuthRoutes } from "modules/Auth/auth.routes";
import sketch from '../../../../assets/p5-sketch'; // Replace with the actual path to your p5-sketch.js file.

declare var p5: any;

@Component({
    selector: 'auth-root',
    templateUrl: 'auth-root.component.html',
    styleUrls: ['auth-root.component.scss', '../../styles/_shared.scss']
})
export class AuthRootComponent implements AfterViewInit, OnDestroy {
    showVideo = false;
   // private p5Instance: any;

    constructor(private _themeService: ThemeService, private router: Router) {
        router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                const nav = val as NavigationEnd;
                if (nav.url && nav.url.endsWith(`/${AuthRoutes.Registration}`)) {
                    this.showVideo = true;
                } else {
                    this.showVideo = false;
                }
            }
        });
    }

    ngAfterViewInit() {
      //  this.p5Instance = new p5(sketch);
    }

    ngOnDestroy() {
     //   this.p5Instance.remove();
    }
}
