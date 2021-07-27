import { Component, Injector } from '@angular/core';
import {
  KycHistoryModel,
  KycHistoryReviewer,
  PersonalInfoStatus
} from "@app/services/personal-info/personal-info.service";
import { Modal } from "Shared";
import { Observable, of } from "rxjs";
import { TradingAccount, UserModel } from '@app/models/auth/auth.models';
import { UsersService } from '@app/services/users.service';
import { AlertService } from '@alert/services/alert.service';
import { ConfirmModalComponent } from 'modules/UI/components/confirm-modal/confirm-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { AppMemberTradingAccountEditComponent, AppMemberTradingAccountEditConfig } from '../app-member-trading-account-edit/app-member-trading-account-edit.component';

export interface AppMemberTradingAccountsConfig {
  user: UserModel;
}

@Component({
  selector: 'app-member-trading-accounts',
  templateUrl: './app-member-trading-accounts.component.html',
  styleUrls: ['./app-member-trading-accounts.component.scss']
})
export class AppMemberTradingAccountsComponent extends Modal<AppMemberTradingAccountsConfig> {
  public loading: boolean = false;
  public id: string;
  public pwd: string;
  public accountType: string;
  public accountTypes: string[] = ["Demo", "Live"];
  public programType: string;
  public programTypes: string[] = ["Demo", "Funding"];
  public riskTypes: number[] = [1, 2, 0];
  public riskType: number;
  public items: TradingAccount[] = [];

  public get userId(): string {
    return this.data.user.id;
  }

  constructor(injector: Injector, private _usersService: UsersService, private _alertService: AlertService, private _dialog: MatDialog) {
    super(injector);
  }


  riskTypesCaption = (status: number) => {
    switch (status) {
      case 0: return of("Not Specified");
      case 1: return of("Low Risk");
      case 2: return of("Aggressive Risk");
    }
  }

  ngOnInit() {
    this.load();
  }

  attach() {
    let isLive = this.accountType === "Live";
    let isFunding = this.programType === "Funding";
    this.loading = true;
    this._usersService.
      attachTradingAccount(this.id, this.pwd, this.data.user.id, isLive, isFunding, this.riskType).subscribe((data) => {
        this.load();
        this._alertService.success("Attached");
      }, (error) => {
        this._alertService.error("Failed to attach");
        this.loading = false;
      });
  }

  detach(item: TradingAccount) {
    return this._dialog.open(ConfirmModalComponent, {
      data: {
        title: 'Detach account',
        message: `Do you want to detach #${item.id} from user account?`
      }
    }).afterClosed().subscribe((dialogResult: any) => {
      if (dialogResult) {
        this._detach(item.id, item.isLive);
      }
    });
  }

  edit(item: TradingAccount) {
    this._dialog.open<any, AppMemberTradingAccountEditConfig>(AppMemberTradingAccountEditComponent, {
      data: {
        user: this.data.user,
        tradingAccount: item
      }
    }).afterClosed().subscribe((dialogResult: any) => {
      this.load();
    });
  }

  create(isLive: boolean) {
    this.loading = true;
    this._usersService.createTradingAccount(this.data.user.id, isLive).subscribe((data) => {
      this.load();
      this._alertService.success("Created");
    }, (error) => {
      this._alertService.error("Failed to created");
      this.loading = false;
    });
  }

  load() {
    this.loading = true;
    this._usersService.getTradingAccounts(this.data.user.id).subscribe((data) => {
      this.items = data;
      this.loading = false;
    }, (error) => {
      this._alertService.error("Failed to load");
      this.loading = false;
    });
  }

  _detach(id: string, isLive: boolean) {
    this.loading = true;
    this._usersService.detachTradingAccount(id, this.data.user.id, isLive).subscribe((data) => {
      this.load();
      this._alertService.success("Detached");
    }, (error) => {
      this._alertService.error("Failed to detach");
      this.loading = false;
    });
  }

}
