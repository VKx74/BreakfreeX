import { Injectable } from '@angular/core';
import { MT5SocketService } from '../socket/mt5.socket.service';
import { MTBrokerServersProvider } from './mt.servers.service';

@Injectable()
export class MT5BrokerServersProvider extends MTBrokerServersProvider { 

    constructor(private _ws: MT5SocketService) { 
        super(_ws);
    }
}