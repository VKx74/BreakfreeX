import {Component, Input, OnInit} from '@angular/core';
import {PersonalInformationModel} from "@app/services/personal-info/personal-info.service";
import {TzUtils} from "TimeZones";

@Component({
  selector: 'business-account-company-director',
  templateUrl: './business-account-company-director.component.html',
  styleUrls: ['./business-account-company-director.component.scss']
})
export class BusinessAccountCompanyDirectorComponent implements OnInit {

  @Input() director: PersonalInformationModel;

  constructor() { }

  ngOnInit() {
  }

  convertUTCTimeToLocal(time: number): Date {
    return TzUtils.utcToLocalTz(new Date(time));
  }

}
