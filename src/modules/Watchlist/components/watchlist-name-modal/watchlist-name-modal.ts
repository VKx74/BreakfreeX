import {Component, Injector} from '@angular/core';
import {Modal} from "Shared";
import {Observable} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {finalize} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";
import {ScriptsTranslateService} from "@scripting/localization/token";

export enum WatchlistNameModalMode {
    Create,
    Rename
}

export type WatchlistNameModalSubmitHandler = (watchlistName: string, modal: WatchlistNameModalComponent) => Observable<any>;

export interface IWatchlistNameModalConfig {
    mode: WatchlistNameModalMode;
    submitHandler: WatchlistNameModalSubmitHandler;
    watchlistName?: string;
}

@Component({
    selector: 'watchlist-name-modal',
    templateUrl: './watchlist-name-modal.html',
    styleUrls: ['./watchlist-name-modal.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: ScriptsTranslateService
        }
    ]
})
export class WatchlistNameModalComponent extends Modal<IWatchlistNameModalConfig> {
    Modes = WatchlistNameModalMode;
    formGroup: FormGroup;
    processing: boolean;

    get mode() {
        return this.data.mode;
    }

    get submitHandler() {
        return this.data.submitHandler;
    }

    constructor(_injector: Injector) {
        super(_injector);
    }

    ngOnInit() {
        this.formGroup = new FormGroup({
            watchlistName: new FormControl(this.data.watchlistName || '', [Validators.required])
        });
    }

    submit() {
        if (this.formGroup.invalid) {
            return;
        }

        this.processing = true;
        this.submitHandler(this.formGroup.controls['watchlistName'].value, this)
            .pipe(finalize(() => this.processing = false))
            .subscribe();
    }

}
