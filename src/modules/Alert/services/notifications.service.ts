import {Observable, of} from "rxjs";

export abstract class NotificationsService {

    abstract show(message: Observable<string> | string, title?: string | Observable<string>);
}
