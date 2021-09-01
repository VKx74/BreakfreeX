import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { IdentityService } from "@app/services/auth/identity.service";
declare var ResizeObserver;

@Component({
    selector: 'sonar-feed-card',
    templateUrl: './sonar-feed-card.component.html',
    styleUrls: ['./sonar-feed-card.component.scss']
})
export class SonarFeedCardComponent implements OnInit {
    @ViewChild('chartContainer', { static: true }) chartContainer: ElementRef;
    @ViewChild('cardContainer', { static: true }) cardContainer: ElementRef;

    constructor(protected _identityService: IdentityService, private host: ElementRef) {
    }

    ngOnInit() {
        const observer = new ResizeObserver(entries => {
            const width = entries[0].contentRect.width;
            this._adjustChartHeight(width);
        });

        observer.observe(this.host.nativeElement);
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
    }

    private _adjustChartHeight(containerWidth: number) {
        if (!this.chartContainer) {
            return;
        }

        let requiredHeigh = Math.trunc(containerWidth / 4 * 2);
        if (requiredHeigh < 160) {
            requiredHeigh = 160;
        }

        this.chartContainer.nativeElement.style.height = `${requiredHeigh}px`;
    }
}