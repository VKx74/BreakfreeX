import {Component} from "@angular/core";
import {ThemeService} from "@app/services/theme.service";

@Component({
    selector: 'auth-root',
    templateUrl: 'auth-root.component.html',
    styleUrls: ['auth-root.component.scss', '../../styles/_shared.scss']
})
export class AuthRootComponent {
    constructor(private _themeService: ThemeService) {
        this._themeService.setAuthTheme();
    }


    ngOnDestroy() {
    }
}
