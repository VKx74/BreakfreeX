import {Directive, Input} from "@angular/core";
import {Roles} from "@app/models/auth/auth.models";
import {JsUtil} from "../../../utils/jsUtil";
import {BaseRoleDirective} from "./base-role.directive";

/*
* example:
*   <span *hideIfRole=[Roles.Admin, Roles.PersonalAccount]>Hide me</span
*   <span *hideIfRole="Roles.Admin">Hide me</span
*
* */

@Directive({
    selector: '[hideIfRole]'
})
export class HideIfRoleDirective extends BaseRoleDirective {
    @Input('hideIfRole') set roles(roles: Roles | Roles[]) {
        if (roles) {
            this._roles = JsUtil.flattenArray([roles]);
        }
    }

    ngOnInit() {
        if (this._checkCurrentUserRole()) {
            this._viewContainerRef.clear();
        } else {
            this._viewContainerRef.createEmbeddedView(this._templateRef);
        }
    }
}
