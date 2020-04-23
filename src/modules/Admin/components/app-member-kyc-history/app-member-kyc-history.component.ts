import {Component, Injector} from '@angular/core';
import {
  KycHistoryModel,
  KycHistoryReviewer,
  PersonalInfoStatus
} from "@app/services/personal-info/personal-info.service";
import {Modal} from "Shared";
import {Observable} from "rxjs";

interface IKycHistoryData {
  loadHistory: Observable<KycHistoryModel[]>;
}

@Component({
  selector: 'app-member-kyc-history',
  templateUrl: './app-member-kyc-history.component.html',
  styleUrls: ['./app-member-kyc-history.component.scss']
})
export class AppMemberKycHistoryComponent extends Modal<IKycHistoryData> {
  isLoading: boolean = true;
  history: KycHistoryModel[] = [];

  get PersonalInfoStatus() {
    return PersonalInfoStatus;
  }

  get KycHistoryReviewer() {
    return KycHistoryReviewer;
  }

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit() {
    this.data.loadHistory
        .subscribe((history) => {
          this.history = history;
          this.isLoading = false;
        }, e => {
          console.log(e);
          this.close();
        });
  }

}
