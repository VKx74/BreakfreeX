import {Component, Inject, Injector, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {Modal} from "Shared";

@Component({
  selector: 'modal-alert-code',
  templateUrl: './modal-alert-code.component.html',
  styleUrls: ['./modal-alert-code.component.scss']
})
export class ModalAlertCodeComponent extends Modal<string> implements OnInit {

  constructor(
      injector: Injector,
      @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    super(injector);
  }

  ngOnInit() {
    console.log(this.data);
  }

}
