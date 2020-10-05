import {Observable, Subject, Observer, of} from "rxjs";
import { MTGetServersRequest, MTGetServersResponse, MTResponseMessageBase } from 'modules/Trading/models/forex/mt/mt.communication';
import { MTServer } from 'modules/Trading/models/forex/mt/mt.models';
import { MTSocketService } from '../socket/mt.socket.service';

export abstract class MTBrokerServersProvider { 
    private _servers: MTServer[] = [];

    constructor(private ws: MTSocketService) { 

    }

    public loadServers(): Observable<MTServer[]> {
        if (this._servers && this._servers.length) {
            return of(this._servers);
        }

        return new Observable<MTServer[]>((observer: Observer<MTServer[]>) => {
            let request: MTGetServersRequest;
            const onMessageSubscription = this.ws.onMessage.subscribe(value => {
                try {
                    const msgData = value as MTResponseMessageBase;
                    if (msgData.MessageId === request.MessageId) {
                        const response = value as MTGetServersResponse;
    
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
                        onMessageSubscription.unsubscribe();
                    }
                } catch (e) {
                    console.log('Failed to parse ws message in MTBrokerServersProvider');
                    console.log(e);

                    observer.error(e);
                    observer.complete();
                }
            });

            this.ws.open().subscribe(value => {
                request = new MTGetServersRequest();
                this.ws.send(request);
            }, error => {
                observer.error(error);
            });
        });
    }
}