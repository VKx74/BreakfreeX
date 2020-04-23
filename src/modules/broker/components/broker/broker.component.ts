import {Component, OnInit} from '@angular/core';
import {ApplicationType} from "../../../../app/enums/ApplicationType";
import {ApplicationTypeService} from "../../../../app/services/application-type.service";
import {BrokerService} from "../../../../app/services/broker.service";

@Component({
  selector: 'broker',
  templateUrl: './broker.component.html',
  styleUrls: ['./broker.component.scss']
})
export class BrokerComponent implements OnInit {

    get ApplicationTypes()  {
        return ApplicationType;
    }

    get applicationType()  {
        return this._applicationTypeService.applicationType;
    }

    constructor(private _applicationTypeService: ApplicationTypeService,
                private _broker: BrokerService) {

    }

    ngOnInit() {
    }

}
