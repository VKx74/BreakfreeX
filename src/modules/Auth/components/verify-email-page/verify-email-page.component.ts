import { Component, OnInit } from '@angular/core';
import {first} from "rxjs/operators";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'verify-email-page',
  templateUrl: './verify-email-page.component.html',
  styleUrls: ['./verify-email-page.component.scss']
})
export class VerifyEmailPageComponent implements OnInit {
  readonly prefixUrl = 'http://';

  redirectUrl = '';

  constructor(private _route: ActivatedRoute) { }

  ngOnInit() {
    this._route.queryParams
        .pipe(first())
        .subscribe(params => {
          if (params['email']) {
            this.redirectUrl = this.prefixUrl + params['email'];
          }
        });
  }
}
