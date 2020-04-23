import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {DomSanitizer} from "@angular/platform-browser";
import {HttpClient} from "@angular/common/http";
import {AppConfigService} from "@app/services/app.config.service";
import {ISystemMonitoringQueryParams, URLS_MAP} from "../../../data/system-monitoring.models";

@Component({
    selector: 'iframe-container',
    templateUrl: './iframe-container.component.html',
    styleUrls: ['./iframe-container.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IframeContainerComponent implements OnInit {
    readonly URLS = AppConfigService.config.systemMonitoringUrls;
    loading = true;
    url: string;

    constructor(private _router: Router,
                private _route: ActivatedRoute,
                private _cdRef: ChangeDetectorRef,
                private _sanitizer: DomSanitizer) {
    }

    ngOnInit() {
        this.url = this.getSanitizedUrl(this.URLS.platform.services);
        this._route.queryParams.subscribe((params: ISystemMonitoringQueryParams) => {
            this.loading = true;
            this.url = params ? this.getSanitizedUrl(URLS_MAP[params.type][params.subtype]) : this.url;
            this._cdRef.markForCheck();
        });
    }

    onIFrameLoaded() {
        this.loading = false;
    }

    getSanitizedUrl(url: string): string {
        return this._sanitizer.bypassSecurityTrustResourceUrl(url) as string || '';
    }

}
