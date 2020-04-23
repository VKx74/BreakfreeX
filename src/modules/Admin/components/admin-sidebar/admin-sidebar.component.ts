import {AfterViewInit, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChildren} from '@angular/core';
import {AdminRoutes} from "../../admin.routes";
import {ComponentIdentifier} from "@app/models/app-config";
import {Roles} from "@app/models/auth/auth.models";
import {SidebarSectionComponent} from "../../../sidebar/components/sidebar-section/sidebar-section.component";
import {AppRoutes} from "AppRoutes";
import {LandingRoutes} from "../../../Landing/landing.routes";
import {TranslateService} from "@ngx-translate/core";
import {AppTranslateService} from "@app/localization/token";
import {ComponentAccessService} from "@app/services/component-access.service";
import {memoize} from "@decorators/memoize";

@Component({
    selector: 'admin-sidebar',
    templateUrl: './admin-sidebar.component.html',
    styleUrls: ['./admin-sidebar.component.scss', '../../../sidebar/styles/sidebar.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: AppTranslateService
        }
    ]
})
export class AdminSidebarComponent implements OnInit, AfterViewInit {
    @ViewChildren(SidebarSectionComponent, {read: ElementRef}) sidebarSections: QueryList<ElementRef<HTMLElement>>;
    ComponentIdentifier = ComponentIdentifier;
    AdminRoutes = AdminRoutes;
    AppRoutes = AppRoutes;
    LandingRoutes = LandingRoutes;
    Roles = Roles;

    constructor(private _renderer: Renderer2) {
    }

    ngOnInit() {
    }

    ngAfterViewInit(): void {
        this._removeSectionsWithoutItems();
    }


    // @memoize()
    // isAccessibleComponents(components: ComponentIdentifier[]): boolean {
    //     return ComponentAccessService.isAccessibleComponentsArray(components);
    // }

    private _removeSectionsWithoutItems(): void {
        for (let sectionRef of this.sidebarSections.toArray()) {
            const section = sectionRef.nativeElement.firstChild as HTMLElement;

            // remove node if only label element present
            if (section.children.length < 2) {
                this._renderer.removeChild(sectionRef.nativeElement, section);
            }
        }
    }
}
