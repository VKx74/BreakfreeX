import {Injectable} from "@angular/core";
import {Theme} from "../enums/Theme";
import {BehaviorSubject, Observable} from "rxjs";
import {filter, map, pairwise} from "rxjs/operators";

@Injectable()
export class ThemeService {
    activeTheme$ = new BehaviorSubject(null);
    prevTheme$ = new BehaviorSubject(null);
    activeThemeChange$: Observable<Theme>;

    get activeTheme(): Theme {
        return this.activeTheme$.value;
    }

    constructor() {

        this.activeThemeChange$ = this.activeTheme$.pipe(filter(theme => theme != null));
        this.activeTheme$
            .pipe(
                pairwise(),
                map(([prevTheme, currentTheme]: [Theme, Theme]) => prevTheme)
            )
            .subscribe(this.prevTheme$);

        // this.setActiveTheme(Theme.Dark, false);
    }

    getThemesList(): Theme[] {
        return [
            Theme.Light,
            Theme.Dark,
        ];
    }

    getActiveTheme(): Theme {
        return this.activeTheme$.getValue();
    }

    setActiveTheme(theme: Theme) {
        if (theme !== this.activeTheme) {
            this.activeTheme$.next(theme);
            this.setElementCssClasses(document.body);
        }
    }

    setAuthTheme() {
        this.setActiveTheme(Theme.Light);
    }

    setAdminAreaTheme() {
        // this.activeTheme$
        //     .subscribe(theme => this.setActiveTheme(this.activeTheme));
    }

    setForumAreaTheme() {
        this.setActiveTheme(Theme.Dark);
    }

    reset() {
        this.setActiveTheme(Theme.Dark);
    }

    setupElementCssClasses(element: HTMLElement) {
        this.setElementCssClasses(element);
        this.activeThemeChange$
            .subscribe(() => {
                this.setElementCssClasses(element);
            });
    }

    setElementCssClasses(element: HTMLElement) {
        const prevTheme = this.prevTheme$.getValue();
        const theme = this.activeTheme$.getValue();

        if (prevTheme != null) {
            $(element).removeClass(this._getThemeCssClass(prevTheme));
            $(element).removeClass(this.getTCDThemeCssClass(prevTheme));
        }

        $(element).addClass(this._getThemeCssClass(theme));
        $(element).addClass(this.getTCDThemeCssClass(theme));
    }

    private _getThemeCssClass(theme: Theme): string {
        switch (theme) {
            case Theme.Dark:
                return 'Dark-theme';
            case Theme.Light:
                return 'Light-theme';
            default:
                return 'Dark-theme';
        }
    }

    private getTCDThemeCssClass(theme: Theme): string {
        switch (theme) {
            case Theme.Dark:
                return 'thmFintatechDarkTheme';
            case Theme.Light:
                return 'thmLightTheme';
            default:
                return 'thmFintatechDarkTheme';
        }
    }
}
