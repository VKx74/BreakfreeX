import {ChangeDetectorRef, Injectable, Pipe, PipeTransform} from "@angular/core";
import {TranslatePipe} from "@ngx-translate/core";

/*
* Use specified translateService for translation
*
* example: <span>{{ 'key' | translateViaService:translateService }}</span>
*
* */


@Injectable()
@Pipe({
    name: 'translateViaService',
    pure: false
})
export class TranslateViaServicePipe implements PipeTransform {
    private _translatePipe: TranslatePipe;
    private _prevKey: string = null;

    constructor(private _ref: ChangeDetectorRef) {
    }


    transform(key: string, ...args: any[]) {
        if (args.length === 0) {
            throw new Error('Translate service for translate pipe is not defined');
        }

        if (key === this._prevKey) {
            return this._translatePipe.value;
        }

        const interpolation = args.length === 2 ? args[0] : null;
        const translateService = args.length === 2 ? args[1] : args[0];

        this._translatePipe = new TranslatePipe(translateService, this._ref);
        this._prevKey = key;

        return this._translatePipe.transform(key, interpolation);
    }
}
