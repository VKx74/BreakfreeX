import {Component, Inject, Injector, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NewsService} from "../../../services/news.service";
import {AlertService} from "@alert/services/alert.service";
import {finalize} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs";
import {INews, News} from "../../../../News/models/models";
import {Modal} from "Shared";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

interface ResolvedData {
    news: INews;
}

type INewsFormControls = {
    [key in keyof Required<INews>]: AbstractControl;
};

@Component({
    selector: 'create-news',
    templateUrl: './create-news.component.html',
    styleUrls: ['./create-news.component.scss']
})
export class CreateNewsComponent extends Modal<string> implements OnInit {
    readonly MIN_CONTENT_LENGTH = 3;
    readonly MAX_CONTENT_LENGTH = 10000;
    newsForm: FormGroup;
    loading = false;
    news: INews;
    creationTime: number;

    get isEdit(): boolean {
        return !!this.idNews;
    }

    get formValue(): INews {
        return this.newsForm.value;
    }

    get isValid(): boolean {
        return this.newsForm.valid;
    }

    get controls(): INewsFormControls {
        return this.newsForm.controls as INewsFormControls;
    }

    get tagsList(): string[] {
        return this.controls.tags.value;
    }

    get resolvedData(): ResolvedData {
        return this._route.snapshot.data as ResolvedData;
    }

    constructor(injector: Injector,
                @Inject(MAT_DIALOG_DATA) public idNews: string,
                private _fb: FormBuilder,
                private _newsService: NewsService,
                private _route: ActivatedRoute,
                private _router: Router,
                private _alertService: AlertService) {
        super(injector);
    }

    ngOnInit() {
        this.news = new News(this.resolvedData.news);
        this.newsForm = this._getNewsForm();

        if (this.idNews) {
            this._newsService.getNews(this.idNews).subscribe(news => {
                this.controls.content.setValue(news.content);
                this.controls.title.setValue(news.title);
                this.controls.tags.setValue(news.tags);
                this.controls.description.setValue(news.description);
            });
        }
    }

    submit() {
        let request = this._newsService.createNews(this.formValue);
        if (this.idNews) {
            request = this._newsService.updateNews(this.idNews, this.formValue);
            this._submitHandler(request, 'News has been successfully edited', 'Failed to edit news');
        } else {
            this._submitHandler(request, 'News has been successfully created', 'Failed to create news');
        }
    }

    addTag(tag: string) {
        this.controls.tags.setValue([...this.tagsList, tag]);
    }

    removeTag(tag: string) {
        this.controls.tags.setValue(this.formValue.tags.filter(t => t !== tag));
    }

    getControlValue(name: string): string {
        if (this.controls[name]) {
            return this.controls[name].value;
        }
    }

    private _submitHandler(req: Observable<any>, successMessage: string, errorMessage: string) {
        this.loading = true;
        req.pipe(finalize(() => this.loading = false))
            .subscribe(
                () => {
                    this._alertService.success(successMessage);
                    this.close();
                },
                () => this._alertService.error(errorMessage),
            );
    }

    private _getNewsForm(): FormGroup {
        return this._fb.group({
            title: [this.news.title, [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(200)]
            ],
            description: [this.news.description, [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(200)]
            ],
            content: [this.news.content, [
                Validators.required,
                Validators.minLength(this.MIN_CONTENT_LENGTH),
                Validators.maxLength(this.MAX_CONTENT_LENGTH)]
            ],
            tags: [this.news.tags]
        });
    }
}
