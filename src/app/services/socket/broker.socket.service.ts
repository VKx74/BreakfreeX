import { WebsocketBase } from "@app/interfaces/socket/socketBase";
import { ReadyStateConstants } from "@app/interfaces/socket/WebSocketConfig";
import { BrokerAuthRequest, BrokerRequestMessageBase, BrokerResponseMessageBase } from "modules/Trading/models/communication";
import { Observable, Subscriber } from "rxjs";
import { IdentityService } from "../auth/identity.service";

export abstract class BrokerSocketService extends WebsocketBase {
    protected _subscribers: { [id: string]: Subscriber<BrokerResponseMessageBase>; } = {};
    protected _authSucceeded: boolean;
    protected _brokerConnected: boolean;
    protected _token: string;
  
    constructor(protected _identityService: IdentityService) {
      super();
    }
  
    sendAuth(): Observable<void> {
      return new Observable<void>(subscriber => {
        if (this._identityService.isExpired) {
            this._identityService.refreshTokens().subscribe(() => {
              this._open(subscriber);
            }, (error) => {
              this._open(subscriber);
            });
        } else {
          this._open(subscriber);
        }
      });
    }
  
    setConnectivity(connected: boolean) {
      this._brokerConnected = connected;
    }
  
    open(): Observable<void> {
      return new Observable<void>(subscriber => {
        if (this.readyState === ReadyStateConstants.OPEN) {
            subscriber.next();
            return;
        }
  
        if (this._identityService.isExpired) {
            this._identityService.refreshTokens().subscribe(() => {
              this._open(subscriber);
            }, (error) => {
              this._open(subscriber);
            });
        } else {
          this._open(subscriber);
        }
  
      });
    }
  
    protected _open(subscriber: Subscriber<void>) {
      super.open().subscribe(() => {
        const authRequest = new BrokerAuthRequest();
        authRequest.Data = {
          Token: "Bearer " + this._identityService.token
        }; 
  
        // subscriber.next();
        // subscriber.complete();
  
        this.auth(authRequest).subscribe((res) => {
          if (res.IsSuccess) {
            this._authSucceeded = true;
            subscriber.next();
            subscriber.complete();
          } else {
            this._authSucceeded = false;
            this.close();
            subscriber.error(res.ErrorMessage);
            subscriber.complete();
          }
        }, (error1) => {
          this._authSucceeded = false;
          this.close();
          subscriber.error(error1);
          subscriber.complete();
        });
  
      }, (error) => {
        subscriber.error(error);
        subscriber.complete();
      });
    }
  
    protected _reconnect() {
      if (!this._authSucceeded) {
        return;
      }
  
      if (!this._brokerConnected) {
        return;
      }
      super._reconnect();
    }
  
    protected auth(data: BrokerAuthRequest): Observable<BrokerResponseMessageBase> {
      return new Observable<BrokerResponseMessageBase>(subscriber => {
        this._send(data, subscriber);
      });
    }
  
    protected _send(data: BrokerRequestMessageBase, subscriber: Subscriber<BrokerResponseMessageBase>) {
      try {
        this._subscribers[data.MessageId] = subscriber;
        const sent = this.send(data);
        if (!sent) {
          subscriber.error("Failed to send message");
          subscriber.complete();
        }
      } catch (error) {
        subscriber.error(error.message);
        subscriber.complete();
      }
    }
  }