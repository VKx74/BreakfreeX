import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {OrderSide} from "../../models/models";

@Component({
    selector: 'order-side',
    templateUrl: './order-side.component.html',
    styleUrls: ['./order-side.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderSideComponent implements OnInit {
    @Input() side: OrderSide;
    OrderSide = OrderSide;

    constructor() {
    }

    ngOnInit() {
    }

}
