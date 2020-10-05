import { Injectable } from '@angular/core';
import { MT4SocketService } from '../socket/mt4.socket.service';
import { MTBrokerServersProvider } from './mt.servers.service';

@Injectable()
export class MT4BrokerServersProvider extends MTBrokerServersProvider { 

    constructor(private _ws: MT4SocketService) { 
        super(_ws);
    }
}