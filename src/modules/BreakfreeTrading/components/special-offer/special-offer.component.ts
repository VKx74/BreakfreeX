import { Component, ElementRef, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { Modal } from "Shared";
import { IdentityService } from '@app/services/auth/identity.service';

@Component({
    selector: 'special-offer',
    templateUrl: './special-offer.component.html',
    styleUrls: ['./special-offer.component.scss']
})
export class SpecialOfferComponent extends Modal<SpecialOfferComponent> implements OnInit {
    public imageClass: string = "img_1";

    constructor(protected _injector: Injector, protected _identityService: IdentityService) {
        super(_injector);
        let randomClass = Math.floor(Math.random() * 4) + 1;
        if (randomClass === 2) {
            this.imageClass = "img_2";
        } else if (randomClass === 3) {
            this.imageClass = "img_3";
        } else if (randomClass === 4) {
            this.imageClass = "img_4";
        }
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
    }
}
