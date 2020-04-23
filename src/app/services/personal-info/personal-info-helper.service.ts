import {Injectable} from "@angular/core";
import {Observable, of} from "rxjs";
import {PersonalInfoDocumentType, PersonalInfoStatus} from "./personal-info.service";

@Injectable({
    providedIn: 'root'
})
export class PersonalInfoHelper {
    constructor() {
    }

    getPersonalInfoStatusStr(status: PersonalInfoStatus): Observable<string> {
        switch (status) {
            case PersonalInfoStatus.Approve:
                return of('Approved');
            case PersonalInfoStatus.Rejected:
                return of('Rejected');
            case PersonalInfoStatus.Pending:
                return of('Pending');
            case PersonalInfoStatus.None:
            default:
                return of('None');
        }
    }

    getPersonalInfoDocumentName(documentType: PersonalInfoDocumentType): string {
        const map = {
            [PersonalInfoDocumentType.IdentityCard]: 'Identity Card',
            [PersonalInfoDocumentType.DriversLicense]: 'Drivers License',
            [PersonalInfoDocumentType.Passport]: 'Passport'
        };

        return map[documentType];
    }
}