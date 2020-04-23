import {ChangeDetectorRef, Inject, Injectable, Pipe, PipeTransform} from "@angular/core";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {AppTranslateService} from "@app/localization/token";

@Injectable()
@Pipe({
    name: 'appTranslate',
    pure: false
})
export class AppTranslatePipe implements PipeTransform {
    private _translatePipe: TranslatePipe;
    private _prevKey: string = null;

    constructor(private _ref: ChangeDetectorRef,
                @Inject(AppTranslateService) private _translateService: TranslateService) {
    }


    transform(key: string, ...args: any[]) {
        if (key === this._prevKey) {
            return this._translatePipe.value;
        }

        const interpolation = args.length === 2 ? args[0] : null;

        this._translatePipe = new TranslatePipe(this._translateService, this._ref);
        this._prevKey = key;

        return this._translatePipe.transform(key, interpolation);
    }
}
