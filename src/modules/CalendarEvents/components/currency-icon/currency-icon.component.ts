import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

// export enum CurrencyIconType

@Component({
    selector: 'currency-icon',
    templateUrl: './currency-icon.component.html',
    styleUrls: ['./currency-icon.component.scss'],
})
export class CurrencyIconComponent implements OnInit {
    readonly BASE_FLAGS_URL = '/assets/img/flags/';
    readonly BASE_CURRENCIES_URL = '/assets/img/crypto-currencies/';
    readonly BASE_IMAGE = 'xaf.png';
    @Input() name: string;
    src: string;
    imageError = false;

    constructor() {
    }

    ngOnInit() {
        this.src = `${this.BASE_FLAGS_URL}${this.name.toLowerCase()}.png`;
    }

    onImageError() {
        if (this.imageError) {
            this.src = `${this.BASE_FLAGS_URL}${this.BASE_IMAGE}`;
        } else {
            this.imageError = true;
            this.src = `${this.BASE_CURRENCIES_URL}${this.name.toLowerCase()}.svg`;
        }
    }

}
