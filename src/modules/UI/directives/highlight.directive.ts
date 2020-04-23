import {Directive, ElementRef, Input} from '@angular/core';
import {animate, AnimationBuilder, AnimationPlayer, style} from "@angular/animations";

@Directive({selector: '[highlight]'})
export class HighlightDirective {
    private _highlightColor: string = '*';
    private _animationPlayer: AnimationPlayer;

    @Input() highlightDuration = 400;
    @Input('highlight') set highlightColor(value: string) {
        if (value == null) { // stop animation
            if (this.animationStarted) {
                this._stopAnimation();
            }

            this._highlightColor = '*';
        } else {
            if (value !== this._highlightColor) {
                if (this.animationStarted) {
                    this._stopAnimation();
                }

                if (this._highlightColor !== '*') {
                }

                this._highlightColor = value;
                this._playAnimation();
            }
        }
    }

    get animationStarted(): boolean {
        return this._animationPlayer != null;
    }

    constructor(private _el: ElementRef,
                private _builder: AnimationBuilder) {
    }

    private _playAnimation() {
        const animation = this._builder.build([
            animate(this.highlightDuration / 2, style({backgroundColor: this._highlightColor })),
            animate(this.highlightDuration / 2, style({backgroundColor: '*'}))
        ]);

        this._animationPlayer = animation.create(this._el.nativeElement);

        try { // temp
            this._animationPlayer.play();
            this._animationPlayer.onDone(() => {
                this._animationPlayer.destroy();
                this._animationPlayer = null;
            });
        } catch (e) {

        }
    }

    private _stopAnimation() {
        if (this._animationPlayer && (this._animationPlayer as any).domPlayer) {
            this._animationPlayer.finish();
        }
    }

    ngOnDestroy() {
    }
}
