import {Component} from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import {ThemeService} from "@app/services/theme.service";
import { AuthRoutes } from "modules/Auth/auth.routes";

@Component({
    selector: 'auth-root',
    templateUrl: 'auth-root.component.html',
    styleUrls: ['auth-root.component.scss', '../../styles/_shared.scss']
})
export class AuthRootComponent {
    showVideo = false;
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

    ngOnDestroy() {
    }
}
