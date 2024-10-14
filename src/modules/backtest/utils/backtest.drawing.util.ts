/*
    IMPORTANT NOTICE:  This software and source code is owned and licensed by Breakfree, https://breakfree.cc
    Downloading, installing or otherwise using this software or source code shall be made only under Breakfree License agreement. If you do not granted Breakfree License agreement, you must promptly delete the software, source code and all associated downloadable materials and you must not use the software for any purpose whatsoever.
*

 */

import {IOrder, OrderAction} from "../data/api.models";

export class BacktestDrawingUtil {
    static getOrdersShapes(orders: IOrder[]): TradingChartDesigner.Shape[] {
        return orders.map((order: IOrder) => {
            const isSellOrder = order.action === OrderAction.Sell;
            const shape = isSellOrder
                ? new TradingChartDesigner.ShapeArrowDown()
                : new TradingChartDesigner.ShapeArrowUp();

            const theme = {fill: {fillColor: isSellOrder ? 'rgb(255, 153, 0)' : 'green'}};

            shape.visualDataPoints[0].date = new Date(order.timestamp);
            shape.visualDataPoints[0].value = order.averageFillPrice;
            shape.locked = true;
            shape.selectable = false;
            shape.hoverable = false;
            shape.theme = theme;

            return shape;
        });
    }
}
