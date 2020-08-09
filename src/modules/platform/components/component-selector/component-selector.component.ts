import {Component, EventEmitter, Inject, OnDestroy, Output, Type} from "@angular/core";
import {TcdComponent} from "Chart";
import {Observable} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {ChartTranslateService} from "../../../Chart/localization/token";
import {TradingTranslateService} from "../../../Trading/localization/token";
import {OrderBookChartTranslateService} from "../../../OrderBookChart/localization/token";
import {OrderBookChartComponent} from "../../../OrderBookChart/components/orderBookChart/orderBookChart.component";
import {Level2Component} from "Trading";
import {OrderBookComponent} from '@order-book/components/order-book/order-book.component';
import {WatchlistComponent} from "Watchlist";
import {WatchListTranslateService} from "../../../Watchlist/localization/token";
// import {NewsComponent} from "News";
import {PublicChatComponent} from "../../../Chat/components/public-chat/public-chat.component";
import {ChatTranslateService} from "../../../Chat/localization/token";
import {MarketTradesComponent} from "@market-trades/components/market-trades/market-trades.component";
import {MarketTradesTranslateService} from "@market-trades/localization/token";
import {OrderBookTranslateService} from "@order-book/localization/token";
import {PrivateChatComponent} from "../../../Chat/components/private-chat/private-chat.component";
import {ComponentAccessService} from "@app/services/component-access.service";
import {ComponentIdentifier} from "@app/models/app-config";
import {NewsRootComponent} from "News";
import {NewsTranslateService} from "../../../News/localization/news.token";
import {LocalizationService} from "Localization";
import {AddComponentData, LayoutManagerService} from "angular-golden-layout";
import {takeUntil} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {ComponentPortal} from "@angular/cdk/portal";
import {Overlay} from "@angular/cdk/overlay";
import { BreakfreeTradingBacktestComponent, BreakfreeTradingNavigatorComponent } from 'modules/BreakfreeTrading';
import { BreakfreeTradingTranslateService } from 'modules/BreakfreeTrading/localization/token';

interface IComponent {
    component: Type<any>;
    previewImgClass: string;
    componentName: Observable<string>;
    componentIdentifier: ComponentIdentifier;
}

@Component({
    selector: 'component-selector',
    templateUrl: 'component.selector.component.html',
    styleUrls: ['component.selector.component.scss']
})
export class ComponentSelectorComponent implements OnDestroy {
    @Output() onComponentSelected = new EventEmitter<string>();

    components: IComponent[] = [];
    constructor(
        @Inject(ChartTranslateService) private _chartTranslateService: TranslateService,
        @Inject(TradingTranslateService) private _tradingTranslateService: TranslateService,
        @Inject(NewsTranslateService) private _newsTranslateService: TranslateService,
        @Inject(OrderBookChartTranslateService) private _orderBookChartTranslateService: TranslateService,
        @Inject(WatchListTranslateService) private _watchlistTranslateService: TranslateService,
        @Inject(BreakfreeTradingTranslateService) private _bftTranslateService: TranslateService,
        @Inject(ChatTranslateService) private _chatTranslateService: TranslateService,
        @Inject(MarketTradesTranslateService) private _marketTradesTranslateService: TranslateService,
        @Inject(OrderBookTranslateService) private _orderBookTranslateService: TranslateService
        ) {
    }

    ngOnInit() {
        this.components = this._getComponents().filter(
            component => ComponentAccessService.isAccessible(component.componentIdentifier)
        );
    }

    private _getComponents(): IComponent[] {
        return [
            {
                component: TcdComponent,
                previewImgClass: TcdComponent.previewImgClass,
                componentName: this._chartTranslateService.stream('chartComponentName'),
                componentIdentifier: ComponentIdentifier.chart,
            },
           /* {
                component: OrderBookChartComponent,
                previewImgClass: OrderBookChartComponent.previewImgClass,
                componentName: this._orderBookChartTranslateService.stream('orderBookChartComponentName'),
                componentIdentifier: ComponentIdentifier.orderBookChart,
            },
            {
                component: OrderBookComponent,
                previewImgClass: OrderBookComponent.previewImgClass,
                componentName: this._orderBookTranslateService.stream('componentName'),
                componentIdentifier: ComponentIdentifier.orderBook,
            },
            {
                component: MarketTradesComponent,
                previewImgClass: MarketTradesComponent.previewImgClass,
                componentName: this._marketTradesTranslateService.stream('componentName'),
                componentIdentifier: ComponentIdentifier.marketTrades,
            },*/
            {
                component: WatchlistComponent,
                previewImgClass: WatchlistComponent.previewImgClass,
                componentName: this._watchlistTranslateService.stream('watchlistComponentName'),
                componentIdentifier: ComponentIdentifier.watchlist,
            }, 
            {
                component: BreakfreeTradingBacktestComponent,
                previewImgClass: BreakfreeTradingBacktestComponent.previewImgClass,
                componentName: this._bftTranslateService.stream('BreakfreeTradingBacktestComponentName'),
                componentIdentifier: ComponentIdentifier.breakfreeTradingBacktest,
            },  
            // {
            //     component: BreakfreeTradingDiscoveryComponent,
            //     previewImgClass: BreakfreeTradingDiscoveryComponent.previewImgClass,
            //     componentName: this._bftTranslateService.stream('breakfreeTradingDiscoveryComponentName'),
            //     componentIdentifier: ComponentIdentifier.breakfreeTradingDiscovery,
            // }, 
            {
                component: BreakfreeTradingNavigatorComponent,
                previewImgClass: BreakfreeTradingNavigatorComponent.previewImgClass,
                componentName: this._bftTranslateService.stream('breakfreeTradingNavigatorComponentName'),
                componentIdentifier: ComponentIdentifier.breakfreeTradingNavigator,
            },
           /* {
                component: Level2Component,
                previewImgClass: Level2Component.previewImgClass,
                componentName: this._tradingTranslateService.stream('level2ComponentName'),
                componentIdentifier: ComponentIdentifier.level2View,
            },
            {
                component: NewsRootComponent,
                previewImgClass: NewsRootComponent.previewImgClass,
                componentName: this._newsTranslateService.stream('newsComponentName'),
                componentIdentifier: ComponentIdentifier.news,
            },*/
            {
                component: PublicChatComponent,
                previewImgClass: 'crypto-icon-chat',
                componentName: this._chatTranslateService.stream('publicChatTitle'),
                componentIdentifier: ComponentIdentifier.publicChat,
            },
           /* {
                component: PrivateChatComponent,
                previewImgClass: 'crypto-icon-private-chat',
                componentName: this._chatTranslateService.stream('privateChatTitle'),
                componentIdentifier: ComponentIdentifier.privateChat,
            },*/
        ];
    }

    selectComponent(component: IComponent) {
        this.onComponentSelected.emit(component.componentIdentifier);
    }

    trackByIdentifier(index: number, component: IComponent): string {
        return component.componentIdentifier;
    }

    ngOnDestroy(): void {
    }
}
