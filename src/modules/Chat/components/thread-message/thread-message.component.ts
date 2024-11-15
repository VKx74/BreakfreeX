import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IFileInfo } from "../../models/thread";
import { IdentityService } from "@app/services/auth/identity.service";
import { ConfirmModalComponent } from "UI";
import { MatDialog } from "@angular/material/dialog";
import { FileStorageService } from '@app/services/file-storage.service';
import { TranslateService } from '@ngx-translate/core';
import {IMessage} from "../../models/models";
import {MessageSendingStatus} from '../../enums/message-sending-status';
import {IFileViewDetails} from "../file-info-simple.component/file-info-simple.component";
import {ChatFileUploaderComponent} from "../chat-file-uploader/chat-file-uploader.component";
import {IMessageDTO} from "../../models/api.models";

@Component({
    selector: 'thread-message',
    templateUrl: './thread-message.component.html',
    styleUrls: ['./thread-message.component.scss']
})
export class ThreadMessageComponent {
    @Input() message: IMessage = null;
    @Input() isBanned: boolean = false;
    @Input() isMute: boolean = false;
    @Input() bannedTill: string;
    @Input() isAdminManagement: boolean = false;
    @Output() onUsernameCopied = new EventEmitter<string>();
    @Output() onMessageRemove: EventEmitter<string> = new EventEmitter();
    @Output() onMessageEdit: EventEmitter<IMessage> = new EventEmitter();
    @Output() onMessageResend: EventEmitter<IMessage> = new EventEmitter();
    @Output() onRemoveBan: EventEmitter<IMessage> = new EventEmitter();
    @Output() onBan: EventEmitter<IMessage> = new EventEmitter();
    @Output() onMute: EventEmitter<IMessage> = new EventEmitter();
    userNameColor: string;

    MessageSendingStatus = MessageSendingStatus;


    get isUserMessage(): boolean {
        return this.message && this.message.fromId === this._identityService.id;
    }

    get hasFile(): boolean {
        return this.message.files && this.message.files.length > 0;
    }

    get file() {
        return this.hasFile ? this.message.files[0] : {};
    }

    constructor(private _identityService: IdentityService,
        private _fileservice: FileStorageService,
        private _translateService: TranslateService,
        private _dialog: MatDialog) {
    }

    onAvatarColorSet(nameColor) {
        this.userNameColor = nameColor;
    }

    copyUsernameToChatInput() {
        const username = this.message && this.message.creator && this.message.creator.userName;
        if (username) {
            this.onUsernameCopied.emit(`@${username}`);
        }
    }


    fileClick(fileDetails: IFileViewDetails) {
        if (fileDetails) {
            if (fileDetails.isImage) {
                this._dialog.open(
                    ChatFileUploaderComponent, {
                        data: {
                            viewDetails: fileDetails,
                        }
                    });
            } else {
                this._dialog.open(ConfirmModalComponent, {
                    data: {
                        title: this._translateService.get("fileLoadQuestion"),
                    }
                })
                    .afterClosed()
                    .subscribe((isConfirmed) => {
                        if (isConfirmed) {
                            this._fileservice.getFile(fileDetails.id)
                                .subscribe(
                                    data => {
                                        let url = window.URL.createObjectURL(data);
                                        window.open(url);
                                        console.log(data);
                                    },
                                    error => { console.log(error); },
                                );
                        }
                    });
            }
        }
    }

    showMenuToggle(): boolean {
        if (this._identityService.isAdmin) {
            return true;
        }
        return this.isUserMessage;
    }

    public removeMessage() {
        this._dialog.open(ConfirmModalComponent)
            .afterClosed()
            .subscribe((isConfirmed) => {
                if (isConfirmed) {
                    this.onMessageRemove.emit(this.message.id);
                }
            });
    }

    removeBan(event: MouseEvent)
    {
        if (this.onRemoveBan) {
            this.onRemoveBan.emit(this.message);
        }
        event.preventDefault();
        event.stopImmediatePropagation();
    }
    ban(event: MouseEvent)
    {
        if (this.onBan) {
            this.onBan.emit(this.message);
        }
        event.preventDefault();
        event.stopImmediatePropagation();
    }
    mute(event: MouseEvent)
    {   
        if (this.onMute) {
            this.onMute.emit(this.message);
        }
        event.preventDefault();
        event.stopImmediatePropagation();
    }
}
