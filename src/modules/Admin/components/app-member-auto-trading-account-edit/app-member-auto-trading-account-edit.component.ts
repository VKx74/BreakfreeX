import { Component, Injector } from '@angular/core';
import { Modal } from "Shared";
import { AutoTradingAccount, UserModel } from '@app/models/auth/auth.models';
import { UsersService } from '@app/services/users.service';
import { AlertService } from '@alert/services/alert.service';
import { MatDialog } from '@angular/material/dialog';

export interface AppMemberAutoTradingAccountEditConfig {
  user: UserModel;
  tradingAccount: AutoTradingAccount;
}

@Component({
  selector: 'app-member-auto-trading-account-edit',
  templateUrl: './app-member-auto-trading-account-edit.component.html',
  styleUrls: ['./app-member-auto-trading-account-edit.component.scss']
})
export class AppMemberAutoTradingAccountEditComponent extends Modal<AppMemberAutoTradingAccountEditConfig> {
  public loading: boolean = false;
  public name: string;
  public isActive: boolean;
  public activityTypes: boolean[] = [true, false];
  public item: AutoTradingAccount;

  constructor(injector: Injector, private _usersService: UsersService, private _alertService: AlertService, private _dialog: MatDialog) {
    super(injector);
  }

  ngOnInit() {
    this.name = this.data.tradingAccount.name;
    this.isActive = this.data.tradingAccount.isActive;
  }

  edit() {
    this.loading = true;
    this._usersService.updateAutoTradingAccount(this.data.tradingAccount.id, this.data.tradingAccount.userId, this.name, this.isActive).subscribe((data) => {
      this._alertService.success("Updated");
      this.close();
    }, (error) => {
      this._alertService.error("Failed to update");
      this.loading = false;
    });
  }
}