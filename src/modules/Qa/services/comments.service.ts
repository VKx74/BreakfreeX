import {Injectable} from "@angular/core";
import {QaApiService} from "./api.service";
import {Observable} from "rxjs";
import {CommentModel, ICommentDTO} from "../data/comments";
import {map} from "rxjs/operators";
import {ICreateCommentParams} from "../data/api";

@Injectable()
export class CommentsService {
    constructor(private _apiService: QaApiService) {
    }

    getComments(postId: string): Observable<CommentModel[]> {
        return this._apiService.getComments(postId)
            .pipe(
                map((dtos: ICommentDTO[]) => {
                    return dtos.map(dto => CommentModel.fromDTO(dto));
                })
            );
    }

    createComment(params: ICreateCommentParams): Observable<CommentModel> {
        return this._apiService.createComment(params)
            .pipe(
                map((dto: ICommentDTO) => CommentModel.fromDTO(dto))
            );
    }
}