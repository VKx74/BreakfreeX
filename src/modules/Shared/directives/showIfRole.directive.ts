import {Directive, Input} from "@angular/core";
import {Roles} from "@app/models/auth/auth.models";
import {JsUtil} from "../../../utils/jsUtil";
import {BaseRoleDirective} from "./base-role.directive";

/*
* example:
*   <span *showIfRole=[Roles.Admin, Roles.PersonalAccount]>Show me</span
*   <span *showIfRole="Roles.Admin">Show me</span
*
* */

@Directive({
    selector: '[showIfRole]'
})
export class ShowIfRoleDirective extends BaseRoleDirective {
    @Input('showIfRole') set roles(roles: Roles | Roles[]) {
        if (roles) {
            this._roles = JsUtil.flattenArray([roles]);
        }
    }

    ngOnInit() {
        if (this._checkCurrentUserRole()) {
            this._viewContainerRef.createEmbeddedView(this._templateRef);
        } else {
            this._viewContainerRef.clear();
        }
    }
}
