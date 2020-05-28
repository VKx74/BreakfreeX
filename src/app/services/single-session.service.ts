import {Inject, Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import {AppConfigService} from "@app/services/app.config.service";
import {Observable, Subject, throwError, of} from "rxjs";
import {WebsocketBase} from "@app/interfaces/socket/socketBase";
import {NotificationWebSocketService} from "@app/services/socket/notification.socket.service";
import {catchError} from "rxjs/operators";
import {ActivationKeyResponse, NotificationMessage, NotificationTopics} from "@app/models/notifications/notification";
import {IdentityService} from "@app/services/auth/identity.service";
import { NotificationService } from './notification.service';
import { AuthenticationService } from './auth/auth.service';

@Injectable()
export class SingleSessionService {
    private _closeSessionNotification: string = "CloseSessionNotification";

    constructor(private _identity: IdentityService,
                private _notivifactionService: NotificationService) {
    }

    public watchSessions() {
        this._notivifactionService.onMessage$.subscribe((message: any) => {
            if (message && message.type && message.type === this._closeSessionNotification) {
                this._identity.signOut().subscribe(success => {
                    window.location.reload();
                }, error => {
                    console.log(error);
                });
            }
        });
    }

   
}
