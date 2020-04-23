import {Directive, Inject, Input, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {ComponentAccessService} from "@app/services/component-access.service";
import {ComponentIdentifier} from "@app/models/app-config";
import {memoize} from "@decorators/memoize";
import {Subject} from "rxjs";

@Directive({
    selector: '[showByTag]'
})
export class ShowByTagDirective implements OnInit {
    @Input('showByTag') identifier: ComponentIdentifier;

    constructor(@Inject(ViewContainerRef) protected _viewContainerRef: ViewContainerRef,
                @Inject(TemplateRef) protected _templateRef: TemplateRef<any>) {
    }

    ngOnInit(): void {
        if (this._isComponentAccessible(this.identifier)) {
            this._viewContainerRef.createEmbeddedView(this._templateRef);
        } else {
            this._viewContainerRef.clear();
        }
    }

    // @memoize()
    private _isComponentAccessible(identifier: ComponentIdentifier): boolean {
        return identifier && ComponentAccessService.config[identifier];
    }

    private _showIfAccessible() {
        this._viewContainerRef.clear();
        if (this._isComponentAccessible(this.identifier)) {
            this._viewContainerRef.createEmbeddedView(this._templateRef);
        } else {
            this._viewContainerRef.clear();
        }
    }

}
