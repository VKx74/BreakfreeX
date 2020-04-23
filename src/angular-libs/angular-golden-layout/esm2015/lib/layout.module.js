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
const ɵ0 = GoldenLayoutItemContainerComponent;
export class GoldenLayoutModule {
    /**
     * @return {?}
     */
    static forRoot() {
        return {
            ngModule: GoldenLayoutModule,
            providers: [
                LayoutManagerService
            ]
        };
    }
}
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
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0Lm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItZ29sZGVuLWxheW91dC8iLCJzb3VyY2VzIjpbImxpYi9sYXlvdXQubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUFzQixRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDNUQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLG9EQUFvRCxDQUFDO0FBQ3pGLE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLG1DQUFtQyxDQUFDO0FBQ3ZFLE9BQU8sRUFBQywwQkFBMEIsRUFBQyxNQUFNLGdFQUFnRSxDQUFDO0FBQzFHLE9BQU8sRUFBQyw4QkFBOEIsRUFBQyxNQUFNLDZDQUE2QyxDQUFDO0FBQzNGLE9BQU8sRUFBQyxrQ0FBa0MsRUFBQyxNQUFNLGtGQUFrRixDQUFDO1dBWTlHLGtDQUFrQztBQUl4RCxNQUFNLE9BQU8sa0JBQWtCOzs7O0lBQzNCLE1BQU0sQ0FBQyxPQUFPO1FBQ1YsT0FBTztZQUNILFFBQVEsRUFBRSxrQkFBa0I7WUFDNUIsU0FBUyxFQUFFO2dCQUNQLG9CQUFvQjthQUN2QjtTQUNKLENBQUM7SUFDTixDQUFDOzs7WUF0QkosUUFBUSxTQUFDO2dCQUNOLFlBQVksRUFBRSxDQUFDLHFCQUFxQixFQUFFLGtDQUFrQyxFQUFFLDBCQUEwQixDQUFDO2dCQUNyRyxPQUFPLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxrQ0FBa0MsRUFBRSwwQkFBMEIsQ0FBQztnQkFDaEcsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO2dCQUN2QixlQUFlLEVBQUU7b0JBQ2Isa0NBQWtDO2lCQUNyQztnQkFDRCxTQUFTLEVBQUU7b0JBQ1A7d0JBQ0ksT0FBTyxFQUFFLDhCQUE4Qjt3QkFDdkMsUUFBUSxJQUFvQztxQkFDL0M7aUJBQ0o7YUFDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0dvbGRlbkxheW91dENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL2dvbGRlbi1sYXlvdXQvZ29sZGVuLWxheW91dC5jb21wb25lbnQnO1xuaW1wb3J0IHtMYXlvdXRNYW5hZ2VyU2VydmljZX0gZnJvbSBcIi4vc2VydmljZXMvbGF5b3V0LW1hbmFnZXIuc2VydmljZVwiO1xuaW1wb3J0IHtHb2xkZW5MYXlvdXRQb3B1cENvbXBvbmVudH0gZnJvbSBcIi4vY29tcG9uZW50cy9nb2xkZW4tbGF5b3V0LXBvcHVwL2dvbGRlbi1sYXlvdXQtcG9wdXAuY29tcG9uZW50XCI7XG5pbXBvcnQge0dvbGRlbkxheW91dEl0ZW1Db250YWluZXJUb2tlbn0gZnJvbSBcIi4vdG9rZW5zL2dvbGRlbi1sYXlvdXQtaXRlbS1jb250YWluZXIudG9rZW5cIjtcbmltcG9ydCB7R29sZGVuTGF5b3V0SXRlbUNvbnRhaW5lckNvbXBvbmVudH0gZnJvbSBcIi4vY29tcG9uZW50cy9nb2xkZW4tbGF5b3V0LWl0ZW0tY29udGFpbmVyL2dvbGRlbi1sYXlvdXQtaXRlbS1jb250YWluZXIuY29tcG9uZW50XCI7XG5cbkBOZ01vZHVsZSh7XG4gICAgZGVjbGFyYXRpb25zOiBbR29sZGVuTGF5b3V0Q29tcG9uZW50LCBHb2xkZW5MYXlvdXRJdGVtQ29udGFpbmVyQ29tcG9uZW50LCBHb2xkZW5MYXlvdXRQb3B1cENvbXBvbmVudF0sXG4gICAgZXhwb3J0czogW0dvbGRlbkxheW91dENvbXBvbmVudCwgR29sZGVuTGF5b3V0SXRlbUNvbnRhaW5lckNvbXBvbmVudCwgR29sZGVuTGF5b3V0UG9wdXBDb21wb25lbnRdLFxuICAgIGltcG9ydHM6IFtDb21tb25Nb2R1bGVdLFxuICAgIGVudHJ5Q29tcG9uZW50czogW1xuICAgICAgICBHb2xkZW5MYXlvdXRJdGVtQ29udGFpbmVyQ29tcG9uZW50XG4gICAgXSxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgcHJvdmlkZTogR29sZGVuTGF5b3V0SXRlbUNvbnRhaW5lclRva2VuLFxuICAgICAgICAgICAgdXNlVmFsdWU6IEdvbGRlbkxheW91dEl0ZW1Db250YWluZXJDb21wb25lbnRcbiAgICAgICAgfVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgR29sZGVuTGF5b3V0TW9kdWxlIHtcbiAgICBzdGF0aWMgZm9yUm9vdCgpOiBNb2R1bGVXaXRoUHJvdmlkZXJzIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5nTW9kdWxlOiBHb2xkZW5MYXlvdXRNb2R1bGUsXG4gICAgICAgICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgICAgICAgICBMYXlvdXRNYW5hZ2VyU2VydmljZVxuICAgICAgICAgICAgXVxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==