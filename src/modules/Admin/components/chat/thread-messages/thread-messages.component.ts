import {Component, OnInit} from '@angular/core';
import {IPaginationResponse, PaginationComponent, PaginationResponse} from "@app/models/pagination.model";
import {Observable} from "rxjs";
import {PageEvent} from "@angular/material/typings/paginator";
import {IFileInfo, IThread} from "../../../../Chat/models/thread";
import {ThreadManagerService} from "../thread-manager.service";
import {ActivatedRoute} from "@angular/router";
import {ConfirmModalComponent, IConfirmModalConfig} from "UI";
import {MatDialog} from "@angular/material/dialog";
import {IThreadDetails} from "../../../resolvers/thread-details.resolver";
import {ChatApiService} from "../../../../Chat/services/chat.api.service";
import {ChatFileUploaderComponent} from "../../../../Chat/components/chat-file-uploader/chat-file-uploader.component";
import {FileStorageService} from "@app/services/file-storage.service";
import {IMessageDTO} from "../../../../Chat/models/api.models";

interface IThreadMessagesResolverData {
    messages: Observable<PaginationResponse<IMessageDTO>>;
    threadDetails: Observable<IThreadDetails>;
}

@Component({
    selector: 'thread-messages',
    templateUrl: './thread-messages.component.html',
    styleUrls: ['./thread-messages.component.scss']
})
export class ThreadMessagesComponent extends PaginationComponent<IMessageDTO> implements OnInit {
    threadId: string;
    thread: IThread;
    messages: IMessageDTO[];

    constructor(private _threadService: ChatApiService,
                private _threadManagerService: ThreadManagerService,
                private _activatedRoute: ActivatedRoute,
                private _dialog: MatDialog,
                private _fileservice: FileStorageService,
                ) {
        super();
    }

    ngOnInit() {
        const resolvedData = this._activatedRoute.snapshot.data as IThreadMessagesResolverData;

        resolvedData.threadDetails
            .subscribe(res => {
                this.threadId = res.thread.id;
                this.thread = res.thread;
            });

        resolvedData.messages
            .subscribe(res => {
                this.setPaginationHandler(res);
            });
    }

    onMessageRemove(message: IMessageDTO) {
        this._dialog.open<ConfirmModalComponent, IConfirmModalConfig>(ConfirmModalComponent, {
            data: {
                title: 'Remove message',
                message: 'Are you sure you want to remove message ' + message.content,
            }
        }).afterClosed()
            .subscribe(res => {
                if (res) {
                    this.removeMessage(message);
                }
            });
    }

    removeMessage(message: IMessageDTO) {
        this._threadService.deleteMessageById(message.id)
            .subscribe(() => {
                    // this.messages = this.messages.filter(msg => msg.id !== message.id)
                    this.resetPagination();
                },
                (err) => console.warn('Failed to remove messages', err)
            );
    }

    getItems(): Observable<IPaginationResponse<IMessageDTO>> {
        return this._threadService.getThreadMessagesList(this.threadId, this.paginationParams);
    }

    responseHandler(response: [IPaginationResponse<IMessageDTO>, PageEvent]): void {
        this.messages = response[0].items;
    }

    showFile(file: IFileInfo[]) {
        this._fileservice.getFileInfo(file[0].id)
            .subscribe(
                data => {
                    if (data.data.mimeType.startsWith('image')) {
                        let isImage = !!this._fileservice.getImageUrl(file[0].id);
                        const fileImage = {
                            id: file[0].id,
                            isImage: isImage
                        };
                        this._dialog.open(ChatFileUploaderComponent, {
                            data: {
                                viewDetails: fileImage,
                            }
                        });
                    }
                }
            );
    }

}
