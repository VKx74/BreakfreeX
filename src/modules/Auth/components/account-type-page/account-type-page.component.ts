import {Component, OnInit} from '@angular/core';
import {AuthRoutes} from "../../auth.routes";
import {ActivatedRoute, Router} from "@angular/router";
import {first} from "rxjs/operators";
import {AccountType} from "../../models/models";

@Component({
  selector: 'account-type-page',
  templateUrl: './account-type-page.component.html',
  styleUrls: ['./account-type-page.component.scss']
})
export class AccountTypePageComponent implements OnInit {
  registeredUserEmail: string = '';
  selectedAccountType: AccountType = AccountType.Personal;

  get AccountType() {
    return AccountType;
  }

  constructor(private _router: Router,
              private _route: ActivatedRoute) { }

  ngOnInit() {
    this._route.queryParams
        .pipe(first())
        .subscribe(params => {
          if (params['email']) {
            this.registeredUserEmail = params['email'];
          }
        });
  }

  selectAccountType(type: AccountType) {
    this.selectedAccountType = type;
  }

  registerAccount() {
    let route;
    if (this.selectedAccountType === AccountType.Personal) {
      route = AuthRoutes.PersonalAccount;
    } else if (this.selectedAccountType === AccountType.Business) {
      route = AuthRoutes.BusinessAccount;
    } else {
      route = AuthRoutes.InstitutionalAccount;
    }

    this._router.navigate([route], {
      relativeTo: this._route.parent,
      queryParams: {
        email: this.registeredUserEmail
      }});
  }

  doLogin() {
    this._router.navigate([AuthRoutes.Login], {relativeTo: this._route.parent});
  }

}
