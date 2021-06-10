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

export interface AppMemberTradingAccountEditConfig {
  user: UserModel;
  tradingAccount: TradingAccount;
}

@Component({
  selector: 'app-member-trading-account-edit',
  templateUrl: './app-member-trading-account-edit.component.html',
  styleUrls: ['./app-member-trading-account-edit.component.scss']
})
export class AppMemberTradingAccountEditComponent extends Modal<AppMemberTradingAccountEditConfig> {
  public loading: boolean = false;
  public id: string;
  public pwd: string;
  public accountType: string;
  public accountTypes: string[] = ["Demo", "Live"];
  public riskTypes: number[] = [1, 2, 0];
  public riskType: number;
  public item: TradingAccount;

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
    this.id = this.data.tradingAccount.id;
    this.accountType = this.data.tradingAccount.isLive ? "Live" : "Demo";
    this.riskType = this.data.tradingAccount.riskLevel;
  }

  edit() {
    let isLive = this.accountType === "Live";
    this.loading = true;
    this._usersService.updateTradingAccount(this.id, this.pwd, this.data.user.id, isLive, this.riskType).subscribe((data) => {
      this._alertService.success("Updated");
      this.close();
    }, (error) => {
      this._alertService.error("Failed to update");
      this.loading = false;
    });
  }
}
