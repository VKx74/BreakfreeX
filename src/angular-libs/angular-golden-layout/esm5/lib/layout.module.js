/**
 * @fileoverview added by tsickle
 * Generated from: lib/layout.module.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoldenLayoutComponent } from './components/golden-layout/golden-layout.component';
import { LayoutManagerService } from "./services/layout-manager.service";
import { GoldenLayoutPopupComponent } from "./components/golden-layout-popup/golden-layout-popup.component";
import { GoldenLayoutItemContainerToken } from "./tokens/golden-layout-item-container.token";
import { GoldenLayoutItemContainerComponent } from "./components/golden-layout-item-container/golden-layout-item-container.component";
var ɵ0 = GoldenLayoutItemContainerComponent;
var GoldenLayoutModule = /** @class */ (function () {
    function GoldenLayoutModule() {
    }
    /**
     * @return {?}
     */
    GoldenLayoutModule.forRoot = /**
     * @return {?}
     */
    function () {
        return {
            ngModule: GoldenLayoutModule,
            providers: [
                LayoutManagerService
            ]
        };
    };
    GoldenLayoutModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [GoldenLayoutComponent, GoldenLayoutItemContainerComponent, GoldenLayoutPopupComponent],
                    exports: [GoldenLayoutComponent, GoldenLayoutItemContainerComponent, GoldenLayoutPopupComponent],
                    imports: [CommonModule],
                    entryComponents: [
                        GoldenLayoutItemContainerComponent
                    ],
                    providers: [
                        {
                            provide: GoldenLayoutItemContainerToken,
                            useValue: ɵ0
                        }
                    ]
                },] }
    ];
    return GoldenLayoutModule;
}());
export { GoldenLayoutModule };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0Lm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItZ29sZGVuLWxheW91dC8iLCJzb3VyY2VzIjpbImxpYi9sYXlvdXQubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUFzQixRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDNUQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLG9EQUFvRCxDQUFDO0FBQ3pGLE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLG1DQUFtQyxDQUFDO0FBQ3ZFLE9BQU8sRUFBQywwQkFBMEIsRUFBQyxNQUFNLGdFQUFnRSxDQUFDO0FBQzFHLE9BQU8sRUFBQyw4QkFBOEIsRUFBQyxNQUFNLDZDQUE2QyxDQUFDO0FBQzNGLE9BQU8sRUFBQyxrQ0FBa0MsRUFBQyxNQUFNLGtGQUFrRixDQUFDO1NBWTlHLGtDQUFrQztBQVZ4RDtJQUFBO0lBdUJBLENBQUM7Ozs7SUFSVSwwQkFBTzs7O0lBQWQ7UUFDSSxPQUFPO1lBQ0gsUUFBUSxFQUFFLGtCQUFrQjtZQUM1QixTQUFTLEVBQUU7Z0JBQ1Asb0JBQW9CO2FBQ3ZCO1NBQ0osQ0FBQztJQUNOLENBQUM7O2dCQXRCSixRQUFRLFNBQUM7b0JBQ04sWUFBWSxFQUFFLENBQUMscUJBQXFCLEVBQUUsa0NBQWtDLEVBQUUsMEJBQTBCLENBQUM7b0JBQ3JHLE9BQU8sRUFBRSxDQUFDLHFCQUFxQixFQUFFLGtDQUFrQyxFQUFFLDBCQUEwQixDQUFDO29CQUNoRyxPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUM7b0JBQ3ZCLGVBQWUsRUFBRTt3QkFDYixrQ0FBa0M7cUJBQ3JDO29CQUNELFNBQVMsRUFBRTt3QkFDUDs0QkFDSSxPQUFPLEVBQUUsOEJBQThCOzRCQUN2QyxRQUFRLElBQW9DO3lCQUMvQztxQkFDSjtpQkFDSjs7SUFVRCx5QkFBQztDQUFBLEFBdkJELElBdUJDO1NBVFksa0JBQWtCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7R29sZGVuTGF5b3V0Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvZ29sZGVuLWxheW91dC9nb2xkZW4tbGF5b3V0LmNvbXBvbmVudCc7XG5pbXBvcnQge0xheW91dE1hbmFnZXJTZXJ2aWNlfSBmcm9tIFwiLi9zZXJ2aWNlcy9sYXlvdXQtbWFuYWdlci5zZXJ2aWNlXCI7XG5pbXBvcnQge0dvbGRlbkxheW91dFBvcHVwQ29tcG9uZW50fSBmcm9tIFwiLi9jb21wb25lbnRzL2dvbGRlbi1sYXlvdXQtcG9wdXAvZ29sZGVuLWxheW91dC1wb3B1cC5jb21wb25lbnRcIjtcbmltcG9ydCB7R29sZGVuTGF5b3V0SXRlbUNvbnRhaW5lclRva2VufSBmcm9tIFwiLi90b2tlbnMvZ29sZGVuLWxheW91dC1pdGVtLWNvbnRhaW5lci50b2tlblwiO1xuaW1wb3J0IHtHb2xkZW5MYXlvdXRJdGVtQ29udGFpbmVyQ29tcG9uZW50fSBmcm9tIFwiLi9jb21wb25lbnRzL2dvbGRlbi1sYXlvdXQtaXRlbS1jb250YWluZXIvZ29sZGVuLWxheW91dC1pdGVtLWNvbnRhaW5lci5jb21wb25lbnRcIjtcblxuQE5nTW9kdWxlKHtcbiAgICBkZWNsYXJhdGlvbnM6IFtHb2xkZW5MYXlvdXRDb21wb25lbnQsIEdvbGRlbkxheW91dEl0ZW1Db250YWluZXJDb21wb25lbnQsIEdvbGRlbkxheW91dFBvcHVwQ29tcG9uZW50XSxcbiAgICBleHBvcnRzOiBbR29sZGVuTGF5b3V0Q29tcG9uZW50LCBHb2xkZW5MYXlvdXRJdGVtQ29udGFpbmVyQ29tcG9uZW50LCBHb2xkZW5MYXlvdXRQb3B1cENvbXBvbmVudF0sXG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZV0sXG4gICAgZW50cnlDb21wb25lbnRzOiBbXG4gICAgICAgIEdvbGRlbkxheW91dEl0ZW1Db250YWluZXJDb21wb25lbnRcbiAgICBdLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBwcm92aWRlOiBHb2xkZW5MYXlvdXRJdGVtQ29udGFpbmVyVG9rZW4sXG4gICAgICAgICAgICB1c2VWYWx1ZTogR29sZGVuTGF5b3V0SXRlbUNvbnRhaW5lckNvbXBvbmVudFxuICAgICAgICB9XG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBHb2xkZW5MYXlvdXRNb2R1bGUge1xuICAgIHN0YXRpYyBmb3JSb290KCk6IE1vZHVsZVdpdGhQcm92aWRlcnMge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmdNb2R1bGU6IEdvbGRlbkxheW91dE1vZHVsZSxcbiAgICAgICAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICAgICAgICAgIExheW91dE1hbmFnZXJTZXJ2aWNlXG4gICAgICAgICAgICBdXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19