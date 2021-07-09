import {JsUtil} from "../../../../utils/jsUtil";
import {TcdComponent} from "Chart";
import {OrderBookComponent} from "@order-book/components/order-book/order-book.component";
import {OrderBookChartComponent} from "../../../OrderBookChart/components";
import {MarketTradesComponent} from "@market-trades/components/market-trades/market-trades.component";
import { WatchlistWidgetComponent } from "modules/Watchlist/components/widget/watchlistWidget.component";

export const DefaultState: GoldenLayoutNamespace.Config = {
    settings: {
        selectionEnabled: false
    },
    content: [
        {
            type: 'row',
            content: [
                {
                    type: 'column',
                    content: [
                        {
                            type: 'stack',
                            content: [
                                {
                                    id: JsUtil.generateGUID(),
                                    type: 'component',
                                    componentName: TcdComponent.componentName
                                }
                            ]
                        },
                        {
                            type: 'stack',
                            content: [
                                {
                                    id: JsUtil.generateGUID(),
                                    type: 'component',
                                    componentName: OrderBookComponent.componentName
                                }
                            ]
                        }
                    ]
                },
                {
                    type: 'column',
                    content: [
                        {
                            type: 'stack',
                            content: [
                                {
                                    id: JsUtil.generateGUID(),
                                    type: 'component',
                                    componentName: MarketTradesComponent.componentName
                                },
                                {
                                    id: JsUtil.generateGUID(),
                                    type: 'component',
                                    componentName: WatchlistWidgetComponent.componentName
                                }
                            ]
                        },
                        {
                            type: 'stack',
                            content: [
                                {
                                    id: JsUtil.generateGUID(),
                                    type: 'component',
                                    componentName: OrderBookChartComponent.componentName
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
