import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppConfigService } from "@app/services/app.config.service";
import { Observable } from "rxjs";

@Injectable()
export class SportCountService {
    constructor(private _http: HttpClient) {}

    getSpotsAvailable(): Observable<string> {
        return this._http.get<string>(`https://system-platform-stage.breakfreetrading.com/v1/sysnotification/api/BlackFriday`);
    }
}
