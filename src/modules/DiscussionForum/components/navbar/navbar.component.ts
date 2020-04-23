import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {IdentityService} from "@app/services/auth/identity.service";
import {FileStorageService} from "@app/services/file-storage.service";
import {UsersProfileService} from "@app/services/users-profile.service";
// import {LoginAfterAuthorizeParamName} from "../../../Auth/components/login-page/login-page.component";
import {AppRoutes} from "AppRoutes";
import {AuthRoutes} from "../../../Auth/auth.routes";

@Component({
    selector: 'navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
    @Output() onToggleMenu = new EventEmitter();
    query: string;
    avatarId: string;

    constructor(private _router: Router,
                private _route: ActivatedRoute,
                private _identityService: IdentityService,
                private _usersProfileService: UsersProfileService,
                private _storageService: FileStorageService) {
        this._route.queryParams.subscribe((v) => {
            this.query = v.query ? v.query : '';
        });
    }

    ngOnInit() {
        this._usersProfileService.getUserProfileById(this._identityService.id)
            .subscribe(userProfileModel => {
                this.avatarId = userProfileModel.avatarId;
            }, e => {
                this.avatarId = '';
                console.log(e);
            });
    }


    handleSearch(query: string) {
        this._router.navigate(['search'], {relativeTo: this._route, queryParams: {query: query || undefined}});
    }


}
