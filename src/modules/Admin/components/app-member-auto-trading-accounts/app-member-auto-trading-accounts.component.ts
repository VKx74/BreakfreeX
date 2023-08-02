import { Component, Injector } from '@angular/core';
import {
  KycHistoryModel,
  KycHistoryReviewer,
  PersonalInfoStatus
} from "@app/services/personal-info/personal-info.service";
import { Modal } from "Shared";
import { Observable, of } from "rxjs";
import { AutoTradingAccount, UserModel } from '@app/models/auth/auth.models';
import { UsersService } from '@app/services/users.service';
import { AlertService } from '@alert/services/alert.service';
import { ConfirmModalComponent } from 'modules/UI/components/confirm-modal/confirm-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { AppMemberTradingAccountEditComponent, AppMemberTradingAccountEditConfig } from '../app-member-trading-account-edit/app-member-trading-account-edit.component';
import { AppMemberAutoTradingAccountEditComponent, AppMemberAutoTradingAccountEditConfig } from '../app-member-auto-trading-account-edit/app-member-auto-trading-account-edit.component';

export interface AppMemberAutoTradingAccountsConfig {
  user: UserModel;
}

@Component({
  selector: 'app-member-auto-trading-accounts',
  templateUrl: './app-member-auto-trading-accounts.component.html',
  styleUrls: ['./app-member-auto-trading-accounts.component.scss']
})
export class AppMemberAutoTradingAccountsComponent extends Modal<AppMemberAutoTradingAccountsConfig> {
  public loading: boolean = false;
  public id: string;
  public name: string;
  public items: AutoTradingAccount[] = [];

  public get userId(): string {
    return this.data.user.id;
  }

  constructor(injector: Injector, private _usersService: UsersService, private _alertService: AlertService, private _dialog: MatDialog) {
    super(injector);
  }

  ngOnInit() {
    this.load();
  }

  attach() {
    this.loading = true;
    this._usersService.
      attachAutoTradingAccount(this.id, this.name, this.data.user.id).subscribe((data) => {
        this.load();
        this._alertService.success("Attached");
      }, (error) => {
        this._alertService.error("Failed to attach");
        this.loading = false;
      });
  }

  detach(item: AutoTradingAccount) {
    return this._dialog.open(ConfirmModalComponent, {
      data: {
        title: 'Detach account',
        message: `Do you want to detach #${item.accountId} from user account?`
      }
    }).afterClosed().subscribe((dialogResult: any) => {
      if (dialogResult) {
        this._detach(item.id);
      }
    });
  }

  edit(item: AutoTradingAccount) {
    this._dialog.open<any, AppMemberAutoTradingAccountEditConfig>(AppMemberAutoTradingAccountEditComponent, {
      data: {
        user: this.data.user,
        tradingAccount: item
      }
    }).afterClosed().subscribe((dialogResult: any) => {
      this.load();
    });
  }

  load() {
    this.loading = true;
    this._usersService.getAutoTradingAccounts(this.data.user.id).subscribe((data) => {
      this.items = data;
      this.loading = false;
    }, (error) => {
      this._alertService.error("Failed to load");
      this.loading = false;
    });
  }

  _detach(id: string) {
    this.loading = true;
    this._usersService.detachAutoTradingAccount(id, this.data.user.id).subscribe((data) => {
      this.load();
      this._alertService.success("Detached");
    }, (error) => {
      this._alertService.error("Failed to detach");
      this.loading = false;
    });
  }

}
