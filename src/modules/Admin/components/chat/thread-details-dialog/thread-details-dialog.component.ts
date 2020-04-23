import {Component, Injector, OnInit} from '@angular/core';
import {IThread} from "../../../../Chat/models/thread";
import {Modal} from "Shared";
import {MatSlideToggle} from "@angular/material/typings/slide-toggle";
import {ChatApiService} from "../../../../Chat/services/chat.api.service";

export interface ThreadDetailsComponentData {
  data: IThread;
}


@Component({
  selector: 'thread-details-dialog',
  templateUrl: './thread-details-dialog.component.html',
  styleUrls: ['./thread-details-dialog.component.scss']
})
export class ThreadDetailsDialogComponent extends Modal<IThread> implements OnInit {
  constructor(private _injector: Injector, private _threadService: ChatApiService) {
    super(_injector);
  }

  ngOnInit() {
  }

  public toggleThreadBlockStatus(thread: IThread, toggleElement: MatSlideToggle) {
    toggleElement.disabled = true;
    if (thread.isBlocked) {
      this._threadService.unblockThreadById(thread.id)
          .subscribe(resp => {
            if (resp && resp.success) {
              thread.isBlocked = !thread.isBlocked;
              toggleElement.disabled = false;
            }
          });
    } else {
      this._threadService.blockThreadById(thread.id)
          .subscribe(resp => {
            if (resp && resp.success) {
              thread.isBlocked = !thread.isBlocked;
              toggleElement.disabled = false;
            }
          });
    }
  }

  public toggleThreadEnableStatus(thread: IThread, toggleElement: MatSlideToggle) {
    toggleElement.disabled = true;
    if (thread.isDisabled) {
      this._threadService.enableThreadById(thread.id)
          .subscribe(resp => {
            if (resp && resp.success) {
              thread.isDisabled = !thread.isDisabled;
              toggleElement.disabled = false;
            }
          });
    } else {
      this._threadService.disableThreadById(thread.id)
          .subscribe(resp => {
            if (resp && resp.success) {
              thread.isDisabled = !thread.isDisabled;
              toggleElement.disabled = false;
            }
          });
    }
  }

}
