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
    public itemsLeft = 0;
    public percentageLeft = 0;

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
        let dateEnd = new Date("Jan 05 2024").getTime();
        let dateStart = new Date("Jan 01 2024").getTime();
        let dateNow = new Date().getTime();
        let timeDiff = Math.abs(dateEnd - dateStart);
        let timeLeft = dateEnd - dateNow;

        if (timeLeft <= 0)
        {
            this.itemsLeft = 0;
            this.percentageLeft = 0;
            return;
        }

        let coef = timeLeft / timeDiff;
        this.itemsLeft = Math.floor(10 * coef);
        this.percentageLeft = coef * 100;
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
    }

    get12monthGodPlan()
    {
        if (this.itemsLeft <= 0)
        {
            return;
        }
        window.open("https://buy.stripe.com/4gw4ik5qk2iVfWog0x", '_blank').focus();
    }

    get3monthGodPlan()
    {
        if (this.itemsLeft <= 0)
        {
            return;
        }
        window.open("https://buy.stripe.com/7sIg12cSM0aNdOg6pY", '_blank').focus();
    }
}
