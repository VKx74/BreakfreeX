import { Component, ElementRef } from "@angular/core";
import { IdentityService } from "@app/services/auth/identity.service";
import { UsersProfileService } from "@app/services/users-profile.service";
import { Console } from "console";
import { Content, MediaDetails } from "modules/Academy/models/dto";
import { ContentSectors, GroupedMedia } from "modules/Academy/models/models";
import { WistiaService } from "modules/Academy/services/wistia.service";
import { Observable } from "rxjs";
import { forkJoin } from "rxjs/internal/observable/forkJoin";
@Component({
    selector: 'academy-page-v2',
    templateUrl: 'academy-page-v2.component.html',
    styleUrls: ['academy-page-v2.component.scss']
})
export class AcademyPageV2Component {
    private _loading: boolean;
    private _srcBase: string = "https://fast.wistia.net/embed/iframe/";
    private _src: string;
    private _name: string;
    private _avatarId: string;
    private _selectedContentSector: ContentSectors;
    private _content: Content[];
    private _allMedia: MediaDetails[];
    private _mediaDetails: MediaDetails[];
    private _groupedMedia: GroupedMedia[];
    private _selectedMedia: MediaDetails;

    public get canPrev(): boolean {
        return !!(this.getPrevVideo());
    }

    public get canNext(): boolean {
        return !!(this.getNextVideo());
    }

    public get loading(): boolean {
        return this._loading;
    }

    public get name(): string {
        return this._name;
    }

    public get src(): string {
        return this._src;
    }

    public get content(): Content[] {
        return this._content;
    }

    public get mediaDetails(): MediaDetails[] {
        return this._mediaDetails;
    }

    public get groupedMedia(): GroupedMedia[] {
        return this._groupedMedia;
    }

    public get selectedMedia(): MediaDetails {
        return this._selectedMedia;
    }

    public get avatarId(): string {
        return this._avatarId;
    }

    public get selectedContentSector(): ContentSectors {
        return this._selectedContentSector;
    }

    public set selectedContentSector(value: ContentSectors) {
        if (this._selectedContentSector && value && this._selectedContentSector.Id === value.Id) {
            return;
        }

        this._selectedContentSector = value;
        this.updateContent();
    }


    contentSectors: ContentSectors[] = [{
        Id: "nrdbxd633l",
        Name: "Week 1 [2019]",
        Title: "Week 1 of Breakfree Trading"
    },
    {
        Id: "zctobnmsk9",
        Name: "Week 2 [2019]",
        Title: "Week 2 of Breakfree Trading"
    },
    {
        Id: "ufonh214hz",
        Name: "Week 3 [2021]",
        Title: "Week 3 of Breakfree Trading"
    },
    {
        Id: "zctobnmsk9",
        Name: "Week 4 [2021]",
        Title: "Week 4 of Breakfree Trading"
    }];

    constructor(private _identityService: IdentityService, private _profileService: UsersProfileService, 
        private _wistiaService: WistiaService, private _hostElement: ElementRef) {
        this.selectedContentSector = this.contentSectors[0];
    }

    ngOnInit() {
        this._profileService.getUserProfileById(this._identityService.id, true)
            .subscribe(
                data => {
                    if (data && data.userName) {
                        this._name = data.userName;
                        this._avatarId = data.avatarId;
                    } else {
                        this._name = `${this._identityService.firstName} ${this._identityService.lastName}`;
                    }
                });
    }

    ngOnDestroy() {
    }

    sectorSelected(selected: ContentSectors) {
        this.selectedContentSector = selected;
    }

    selectMedia(media: MediaDetails) {
        this._selectedMedia = media;
        const iframe = this._hostElement.nativeElement.querySelector('iframe');

        if (this._selectedMedia) {
            iframe.src = `${this._srcBase}\\${this._selectedMedia.basic.hashedId}?videoFoam=true`;
        } 
    }

    prevVideo() {
        let prev = this.getPrevVideo();
        if (prev) {
            this.selectMedia(prev);
        }
    }

    nextVideo() {
        let next = this.getNextVideo();
        if (next) {
            this.selectMedia(next);
        }
    }

    getTiming(): string {
        if (!this._selectedMedia) {
            return "--:--:--";
        }

        return new Date(Math.round(this._selectedMedia.basic.duration) * 1000).toISOString().substr(11, 8);
    }

    private updateContent() {
        this._allMedia = [];
        this._mediaDetails = [];
        this._groupedMedia = [];

        if (!this._selectedContentSector) {
            return;
        }

        this._loading = true;
        this._wistiaService.getContentByProject(this._selectedContentSector.Id).subscribe((data: Content[]) => {
            this._content = data;
            this.updateMediaDetails();
        }, (error) => {
            console.error(error);
            this._loading = false;
        });
    }

    private updateMediaDetails() {
        let allTasks: Observable<MediaDetails>[] = [];
        for (const c of this._content) {
            let obs = this._wistiaService.getVideoDetails(c.hashed_id);
            allTasks.push(obs);
        }

        forkJoin(allTasks).subscribe(results => {
            this.buildGroup(results);
        });
    }

    private buildGroup(details: MediaDetails[]) {
        this._loading = false;
        this._allMedia = details;

        if (details) {
            this.selectMedia(details[0]);
        }

        for (const detail of details) {
            let description = detail.basic.description.replace(/<\/?[^>]+(>|$)/g, "");
            let startIndex = description.indexOf('[');
            let endIndex = description.indexOf(']');

            if (startIndex !== 0 || endIndex === -1) {
                this._mediaDetails.push(detail);
                continue;
            }

            let groupName = description.substr(1, endIndex - 1);
            this.addInGroup(detail, groupName);
        }
    }

    private addInGroup(media: MediaDetails, groupName: string) {
        for (const groupedMedia of this._groupedMedia) {
            if (groupedMedia.GroupName === groupName) {
                groupedMedia.MediaData.push(media);
                return;
            }
        }

        this._groupedMedia.push({
            GroupName: groupName,
            MediaData: [media]
        });
    }

    private getNextVideo(): MediaDetails {
        let currentIndex = this._allMedia.indexOf(this._selectedMedia);
        if (currentIndex === -1) {
            return null;
        }

        return this._allMedia[currentIndex + 1];
    }

    private getPrevVideo(): MediaDetails {
        let currentIndex = this._allMedia.indexOf(this._selectedMedia);
        if (currentIndex < 1) {
            return null;
        }

        return this._allMedia[currentIndex - 1];
    }
}
