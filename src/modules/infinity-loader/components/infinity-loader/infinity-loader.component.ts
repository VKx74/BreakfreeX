import {Component, Host, Input, Output, TemplateRef} from "@angular/core";
import {InfinityLoaderService} from "../../services/infinity-loader.service";
import {Observable} from "rxjs";

export enum ScrollDirection {
    Top,
    Bottom
}

export interface InfinityLoaderHandler {
    handleScroll: (direction: ScrollDirection) => Observable<boolean>;
}


@Component({
    selector: 'infinity-loader',
    templateUrl: './infinity-loader.component.html',
    styleUrls: ['./infinity-loader.component.scss'],
})
export class InfinityLoaderComponent {
    @Input() scrollingContainerClass: string;
    @Input() handler: InfinityLoaderHandler;
    @Input() showLoadingIndicator: boolean = true;
    @Input() scrollDirection: ScrollDirection;
    @Input() infiniteScrollContainer: string | HTMLElement;

    @Input() noItemsTemplate: TemplateRef<any>;
    @Input() moreItemsLoadingIndicator: TemplateRef<any>;

    loading: boolean = false;
    isFulfilled: boolean = false;

    @Host() private host: InfinityLoaderComponent;

    handleScrollBottom(data: any) {
        this.handleScroll(ScrollDirection.Bottom);
    }

    handleScrollUp(data: any) {
        this.handleScroll(ScrollDirection.Top);
    }

    handleScroll(scrollDirection: ScrollDirection) {
        if (this.scrollDirection !== scrollDirection) {
            return;
        }

        if (this.isFulfilled || this.loading) {
            return;
        }

        this.loading = true;
        this.handler.handleScroll(scrollDirection)
            .subscribe((moreItemsEnabled: boolean) => {
                this.loading = false;
                this.isFulfilled = !moreItemsEnabled;
            });
    }

    resetIsFulfilled() {
        this.isFulfilled = false;
    }
}
