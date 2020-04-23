import {Router} from "@angular/router";
import {Inject, Injectable} from "@angular/core";
import {QaModuleBasePath} from "../BasePath";
import {QaRoutes} from "../qa.routes";

@Injectable()
export class QaHelperService {
    constructor(private _router: Router,
                @Inject(QaModuleBasePath) private _basePath: string) {
    }

    showTaggedQuestions(tagName: string) {
        this._router.navigate([`${this._basePath}/${QaRoutes.Questions}`], {
            queryParams: {
                tag: tagName
            }
        });
    }
}