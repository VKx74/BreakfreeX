import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PostVote} from "../../data/api";
import {Observable} from "rxjs";

@Component({
    selector: 'vote',
    templateUrl: './vote.component.html',
    styleUrls: ['./vote.component.scss']
})
export class VoteComponent implements OnInit {
    @Input() voteCount: number;
    @Input() vote: PostVote = PostVote.None;
    @Input() voteHandler: (vote: PostVote) => Observable<any>;

    @Output() onVoteUp = new EventEmitter();
    @Output() onVoteDown = new EventEmitter();
    PostVote = PostVote;

    constructor() {
    }

    ngOnInit() {
    }

    doVote(isUpVote: boolean) {
        const vote = isUpVote ? PostVote.Up : PostVote.Down;

        this.voteHandler(vote)
            .subscribe(() => {
            });
    }

}
