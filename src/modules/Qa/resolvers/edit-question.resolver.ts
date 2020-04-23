import {ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {Observable, of} from "rxjs";
import {Injectable} from "@angular/core";
import {IdentityService} from "@app/services/auth/identity.service";
import {catchError, map} from "rxjs/operators";
import {QuestionDTO} from "../data/api";
import {QaApiService} from "../services/api.service";


@Injectable()
export class EditQuestionResolver implements Resolve<QuestionDTO> {
    constructor(private _identityService: IdentityService,
                private _apiService: QaApiService) {
    }

    resolve(route: ActivatedRouteSnapshot): Observable<QuestionDTO> {
        const id = route.params['id'];

        return this._apiService.getQuestion({
            id: id
        })
            .pipe(
                catchError((e) => {
                    console.error(e);
                    return of(null);
                })
            );
    }
}