import {Component, Inject, Input, OnInit} from '@angular/core';
import {IThreadVM} from "../../models/models";
import {ChatModeToken} from "../../mode.token";
import {ChatMode} from "../../enums/chat-mode";
import {FileStorageService} from "@app/services/file-storage.service";

@Component({
    selector: 'thread-list-item',
    templateUrl: './thread-list-item.component.html',
    styleUrls: ['./thread-list-item.component.scss']
})
export class ThreadListItemComponent implements OnInit {
    @Input() thread: IThreadVM;
    @Input() isSelected: boolean = false;
    @Input() chatMode: ChatMode;

    get isPublicThreadsMode(): boolean {
        return this.chatMode === ChatMode.PublicThreads;
    }

    get threadHasAvatar(): boolean {
        return this.thread.pictureId && this.thread.pictureId !== FileStorageService.ChatThreadDefaultPhotoId;
    }

    constructor() {
    }

    ngOnInit() {
    }

}
