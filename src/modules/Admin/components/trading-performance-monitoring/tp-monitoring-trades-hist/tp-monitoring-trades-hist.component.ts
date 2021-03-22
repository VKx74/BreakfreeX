import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { Trade } from "modules/Admin/data/tp-monitoring/TPMonitoringDTO";

@Component({
    selector: 'tp-monitoring-trades-hist',
    templateUrl: 'tp-monitoring-trades-hist.component.html',
    styleUrls: ['tp-monitoring-trades-hist.component.scss']
})
export class TPMonitoringTradesHistComponent implements OnInit {
    pageSize = 50;
    Trades: Array<Trade> = new Array<Trade>();
    showUserName: boolean = true;
    
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;

    @Input() set TradesSet(tradesSet: Array<Trade>) {
        this.Trades = tradesSet;        
    }

    @Input() set Total(total: number) {
        this.paginator.length = total;        
    }
    @Input() set PageIndex(pageIndex: number) {
        this.paginator.pageIndex = pageIndex;
    }

    @Input() set ShowUname(showUname: boolean) {
        this.showUserName = showUname;
    }

    @Output() onNewPage = new EventEmitter<PageEvent>();
    
    ngOnInit() {        
        this.paginator.page.subscribe(this.pageEventHandler.bind(this));
    }

    pageEventHandler(pageEvent: PageEvent) {        
        this.onNewPage.emit(pageEvent);
    }
    
    handleClick(args: any): void {
        /*this._dialog.open(TPMonitoringTradeDetailsComponent, {
            data: args
        }).afterClosed().subscribe(() => {});*/
    }
}