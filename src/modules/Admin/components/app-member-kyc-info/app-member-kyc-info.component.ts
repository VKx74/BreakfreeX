import {Component, Input, OnInit} from '@angular/core';
import {Roles, UserModel} from "@app/models/auth/auth.models";
import {
    AccountInfoModel, BusinessAccountDocumentModel,
    PersonalInfoStatus
} from "@app/services/personal-info/personal-info.service";
import {AccountType} from "../../../Auth/models/models";
import {PersonalInfoHelper} from "@app/services/personal-info/personal-info-helper.service";
import {TzUtils} from "TimeZones";
import {DocumentsUrls, IPersonalInfoData} from "../app-member-info/app-member-info.component";
import {Observable} from "rxjs";

export type ApproveHandler = () => Observable<any>;
export type RejectHandler = (message: string) => Observable<any>;

@Component({
    selector: 'app-member-kyc-info',
    templateUrl: './app-member-kyc-info.component.html',
    styleUrls: ['./app-member-kyc-info.component.scss']
})
export class AppMemberKycInfoComponent implements OnInit {
    @Input() personalInfoData: IPersonalInfoData;

    get personalInfo(): AccountInfoModel {
        return this.personalInfoData.personalInfo;
    }

    get documentsUrls(): DocumentsUrls {
        return this.personalInfoData.documentsUrls;
    }

    @Input() approveHandler: ApproveHandler;
    @Input() rejectHandler: RejectHandler;

    processApprove: boolean;
    processReject: boolean;

    get Roles() {
        return Roles;
    }

    get infoApproved(): boolean {
        return this.personalInfo.status === PersonalInfoStatus.Approve;
    }

    get infoRejected(): boolean {
        return this.personalInfo.status === PersonalInfoStatus.Rejected;
    }

    get approveBtnDisabled(): boolean {
        return this.processApprove || this.processReject || this.infoApproved;
    }

    get rejectBtnDisabled(): boolean {
        return this.processApprove || this.processReject || this.infoRejected;
    }

    get AccountType() {
        return AccountType;
    }

    constructor(private _personalInfoHelper: PersonalInfoHelper) {
    }

    ngOnInit() {
    }

    getPersonalDocumentName(document: BusinessAccountDocumentModel): string {
        return this._personalInfoHelper.getPersonalInfoDocumentName(document.type);
    }

    convertUTCTimeToLocal(time: number): Date {
        return TzUtils.utcToLocalTz(new Date(time));
    }

    reject() {
        const reasonMessage = this._getReasonMessage();

        if (reasonMessage == null) {
            return;
        }


        this.processReject = true;
        this.rejectHandler(reasonMessage)
            .subscribe(() => {
                this.processReject = false;
            });
    }

    approve() {
        this.processApprove = true;
        this.approveHandler()
            .subscribe(() => {
                this.processApprove = false;
            });
    }

    private _getReasonMessage(): string | null {
        let reasonMessage = prompt('Reason', '');

        if (reasonMessage == null) {
            return null;
        }

        reasonMessage = reasonMessage.trim();

        if (reasonMessage.length === 0) {
            reasonMessage = 'Incorrect info';
        }

        return reasonMessage;
    }
}
