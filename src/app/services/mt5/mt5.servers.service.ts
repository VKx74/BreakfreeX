import {Observable, Subject, Observer, of} from "rxjs";
import { Injectable } from '@angular/core';
import { MT5SocketService } from '../socket/mt5.socket.service';
import { MT5GetServersRequest, EMT5MessageType, MT5GetServersResponse, MT5ResponseMessageBase } from 'modules/Trading/models/forex/mt/mt.communication';
import { MT5Server } from 'modules/Trading/models/forex/mt/mt.models';

@Injectable()
export class MT5BrokerServersProvider { 
    private _servers: MT5Server[] = [];

    constructor(private ws: MT5SocketService) { 

    }

    public loadServers(): Observable<MT5Server[]> {
        if (this._servers && this._servers.length) {
            return of(this._servers);
        }

        return new Observable<MT5Server[]>((observer: Observer<MT5Server[]>) => {
            let request: MT5GetServersRequest;
            const onMessageSubscription = this.ws.onMessage.subscribe(value => {
                try {
                    const msgData = value as MT5ResponseMessageBase;
                    if (msgData.MessageId === request.MessageId) {
                        const response = value as MT5GetServersResponse;
    
                        for (const serverResponse of response.Data) {
                            for (const server of serverResponse.Servers) {
                                const is_demo = server.indexOf("Demo") !== -1;
                                this._servers.push({
                                    Broker: serverResponse.BrokerName,
                                    Name: server,
                                    IsDemo: is_demo
                                });
                            }
                        }   
                        observer.next(this._servers);
                        observer.complete();
                    }
                } catch (e) {
                    console.log('Failed to parse ws message in MT5BrokerServersProvider');
                    console.log(e);

                    observer.error(e);
                    observer.complete();
                }
    
                onMessageSubscription.unsubscribe();
            });

            this.ws.open().subscribe(value => {
                request = new MT5GetServersRequest();
                this.ws.send(request);
            }, error => {
                observer.error(error);
            });
        });
    }
}