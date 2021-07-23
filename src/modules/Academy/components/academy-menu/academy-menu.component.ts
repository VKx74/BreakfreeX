import { stringify } from "@angular/compiler/src/util";
import { Component, ElementRef, EventEmitter, Input, Output } from "@angular/core";
import { IdentityService } from "@app/services/auth/identity.service";
import { UsersProfileService } from "@app/services/users-profile.service";
import { Content } from "modules/Academy/models/dto";
import { ContentSectors, GroupedMedia } from "modules/Academy/models/models";
import { WistiaService } from "modules/Academy/services/wistia.service";
import { Subscription } from "rxjs";
import { Subject } from "rxjs/internal/Subject";
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
    private _doNextSubscription: Subscription;
    private _doPrevSubscription: Subscription;

    @Input() doNext: Subject<void>;
    @Input() doPrev: Subject<void>;
    @Input() showUserAvatar: boolean;
    @Input() hidable: boolean;
    @Input() public set isSidebarOpen(value: boolean) {
        this.sidebarOpen = value;
    }

    @Input() public set selectedMedia(value: Content) {
        this._selectedMedia = value;
        this.selectedMediaChange.next(this._selectedMedia);
        this.canDoNext.next(!!(this.getNextVideo() || this.getNextContentSector()));
        this.canDoPrev.next(!!(this.getPrevVideo() || this.getPrevContentSector()));
    }
    @Input() public set selectedContentSector(value: ContentSectors) {
        if (this._selectedContentSector && value && this._selectedContentSector.Id === value.Id) {
            return;
        }

        if (!value) {
            return;
        }

        this._selectedContentSector = value;
        this.selectedContentSectorChange.next(this._selectedContentSector);
    }
    @Output() selectedMediaChange = new EventEmitter<Content>();
    @Output() selectedContentSectorChange = new EventEmitter<ContentSectors>();
    @Output() canDoNext = new EventEmitter<boolean>();
    @Output() canDoPrev = new EventEmitter<boolean>();

    public sidebarOpen: boolean = true;

    public get selectedMedia(): Content {
        return this._selectedMedia;
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


    contentSectors: ContentSectors[] = [{
        Id: "ufonh214hz",
        Name: "BFT Academy - Week 1 [2021]",
        Title: "BFT Academy - Week 1 [2021]"
    },
    {
        Id: "sj7ygoyhmy",
        Name: "BFT Academy - Week 2 [2021]",
        Title: "BFT Academy - Week 2 [2021]"
    },
    {
        Id: "zctobnmsk9",
        Name: "BFT Academy - Extended content",
        Title: "BFT Academy - Extended content"
    }];

    constructor(private _identityService: IdentityService, private _profileService: UsersProfileService, 
        private _wistiaService: WistiaService) {
        this.sectorSelected(this.contentSectors[0]);
    }

    ngOnInit() {
        this._doNextSubscription = this.doNext.subscribe(() => {
            this.nextVideo();
        });
        this._doPrevSubscription = this.doPrev.subscribe(() => {
            this.prevVideo();
        });

        if (!this.showUserAvatar) {
            return;
        }

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
        if (this._doNextSubscription) {
            this._doNextSubscription.unsubscribe();
        }
        if (this._doPrevSubscription) {
            this._doPrevSubscription.unsubscribe();
        }
    }

    sectorSelected(selected: ContentSectors, selLastVideo: boolean = false) {
        this.selectedContentSector = selected;
        this.updateContent(selLastVideo);
    }

    selectMedia(media: Content) {
        this.selectedMedia = media;
    }

    prevVideo() {
        let prev = this.getPrevVideo();
        if (prev) {
            this.selectMedia(prev);
        } else {
            let prevContentSector = this.getPrevContentSector();
            if (prevContentSector) {
                this.sectorSelected(prevContentSector, true);
            }
        }
    }

    nextVideo() {
        let next = this.getNextVideo();
        if (next) {
            this.selectMedia(next);
        } else {
            let nextContentSector = this.getNextContentSector();
            if (nextContentSector) {
                this.sectorSelected(nextContentSector);
            }
        }
    }

    private updateContent(selLastVideo: boolean) {
        this._mediaDetails = [];
        this._groupedMedia = [];

        if (!this._selectedContentSector) {
            return;
        }

        this._loading = true;
        this._wistiaService.getContentByProject(this._selectedContentSector.Id).subscribe((data: Content[]) => {
            this._content = data.sort((item1, item2) => {
                let i1 = item1.name.indexOf(" ");
                let i2 = item2.name.indexOf(" ");
                let name1 = item1.name;
                let name2 = item2.name;
                let numericalName1 = 0;
                let numericalName2 = 0;

                if (i1 !== -1) {
                    name1 = name1.substr(0, i1);
                    numericalName1 = Number(name1);
                }
                if (i2 !== -1) {
                    name2 = name2.substr(0, i2);
                    numericalName2 = Number(name2);
                }

                if (numericalName1 && numericalName2 && !Number.isNaN(numericalName1) && !Number.isNaN(numericalName2)) {
                    return numericalName1 - numericalName2;
                }

                return name1.localeCompare(name2);

            });
            

            if (this._content) {
                this.selectMedia(selLastVideo ? this._content[this._content.length - 1] : this._content[0]);
            }

            this.updateMediaDetails();
        }, (error) => {
            console.error(error);
            this._loading = false;
        });
    }

    private updateMediaDetails() {
        this._loading = false;
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

    private getNextContentSector(): ContentSectors {
        let index = this.contentSectors.indexOf(this.selectedContentSector);
        if (index === -1) {
            return null;
        }

        return this.contentSectors[index + 1];
    }

    private getPrevContentSector(): ContentSectors {
        let index = this.contentSectors.indexOf(this.selectedContentSector);
        if (index < 1) {
            return null;
        }

        return this.contentSectors[index - 1];
    }

    setSidebarState(state: boolean) {
        this.sidebarOpen = state;
    }
}
