import { Component, ElementRef, EventEmitter, Input, Output } from "@angular/core";
import { IdentityService } from "@app/services/auth/identity.service";
import { UsersProfileService } from "@app/services/users-profile.service";
import { Content } from "modules/Academy/models/dto";
import { ContentSectors, GroupedMedia } from "modules/Academy/models/models";
import { WistiaService } from "modules/Academy/services/wistia.service";
@Component({
    selector: 'academy-menu',
    templateUrl: 'academy-menu.component.html',
    styleUrls: ['academy-menu.component.scss']
})
export class AcademyMenuComponent {
    private _loading: boolean;
    private _src: string;
    private _name: string;
    private _avatarId: string;
    private _selectedContentSector: ContentSectors;
    private _content: Content[] = [];
    private _mediaDetails: Content[] = [];
    private _groupedMedia: GroupedMedia[] = [];
    private _selectedMedia: Content;

    @Input() public set selectedMedia(value: Content) {
        this._selectedMedia = value;
        this.selectedMediaChange.next(this._selectedMedia);
        this.nextMediaChange.next(this.getNextVideo());
        this.prevMediaChange.next(this.getPrevVideo());
    }
    @Output() selectedMediaChange = new EventEmitter<Content>();
    @Output() nextMediaChange = new EventEmitter<Content>();
    @Output() prevMediaChange = new EventEmitter<Content>();

    public get selectedMedia(): Content {
        return this._selectedMedia;
    }

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

    public get mediaDetails(): Content[] {
        return this._mediaDetails;
    }

    public get groupedMedia(): GroupedMedia[] {
        return this._groupedMedia;
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
        Id: "sj7ygoyhmy",
        Name: "Week 4 [2021]",
        Title: "Week 4 of Breakfree Trading"
    }];

    constructor(private _identityService: IdentityService, private _profileService: UsersProfileService, 
        private _wistiaService: WistiaService) {
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

    selectMedia(media: Content) {
        this.selectedMedia = media;
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

    private updateContent() {
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
        // let allTasks: Observable<MediaDetails>[] = [];
        // for (const c of this._content) {
        //     let obs = this._wistiaService.getVideoDetails(c.hashed_id);
        //     allTasks.push(obs);
        // }

        // forkJoin(allTasks).subscribe(results => {
        //     this.buildGroup(results);
        // });
        this.buildGroup();
    }

    private buildGroup() {
        this._loading = false;

        if (this._content) {
            this.selectMedia(this._content[0]);
        }

        for (const detail of this._content) {
            let description = detail.description.replace(/<\/?[^>]+(>|$)/g, "");
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

    private addInGroup(content: Content, groupName: string) {
        for (const groupedMedia of this._groupedMedia) {
            if (groupedMedia.GroupName === groupName) {
                groupedMedia.MediaData.push(content);
                return;
            }
        }

        this._groupedMedia.push({
            GroupName: groupName,
            MediaData: [content]
        });
    }

    private getNextVideo(): Content {
        let currentIndex = this._content.indexOf(this.selectedMedia);
        if (currentIndex === -1) {
            return null;
        }

        return this._content[currentIndex + 1];
    }

    private getPrevVideo(): Content {
        let currentIndex = this._content.indexOf(this.selectedMedia);
        if (currentIndex < 1) {
            return null;
        }

        return this._content[currentIndex - 1];
    }
}
