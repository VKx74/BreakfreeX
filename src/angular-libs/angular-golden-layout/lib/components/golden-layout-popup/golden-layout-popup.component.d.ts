import { ApplicationRef, Injector, OnInit } from '@angular/core';
import { IGoldenLayoutComponentConfiguration } from '../../models/configuration';
import { GoldenLayoutComponent } from '../../components/golden-layout/golden-layout.component';
export declare class __Holder {
    configuration: any;
    constructor(configuration: any);
}
export declare function configurationFactory(injector: Injector, holder: __Holder): IGoldenLayoutComponentConfiguration;
export declare class GoldenLayoutPopupComponent implements OnInit {
    private _appRef;
    layout: GoldenLayoutComponent;
    private _popupConfiguration;
    private _componentConfig;
    private _suppressChangeDetection;
    private _destroy;
    constructor(_appRef: ApplicationRef);
    ngOnInit(): void;
    ngDoCheck(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
}
