import {Component, ViewChild, ElementRef, AfterViewInit, EventEmitter, Output, OnDestroy} from '@angular/core';

@Component({
    selector: 'image-from-cam',
    templateUrl: './image-from-cam.component.html',
    styleUrls: ['./image-from-cam.component.scss']
})
export class ImageFromCamComponent implements AfterViewInit, OnDestroy {
    @Output() onBlob = new EventEmitter<Blob>();
    @ViewChild('video', {static: false}) video: ElementRef;
    @ViewChild('canvas', {static: false}) canvas: ElementRef;

    private _stream: MediaStream;

    get stream(): MediaStream {
        return this._stream;
    }

    get showPlaceholder(): boolean {
        return !this._streamActive && !this.showErrorPlaceholder;
    }

    private _streamActive: boolean;

    showErrorPlaceholder: boolean;

    async ngAfterViewInit() {
        const video = this.video.nativeElement;

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});

                this._stream = stream;
                video.srcObject = stream;
                video.play();

                setTimeout(() => { // Temp
                    this._streamActive = true;
                }, 1000);
            } catch (e) {
                this.showErrorPlaceholder = true;
            }
        }
    }

    capturePhoto(): Promise<any> {
        if (!this._streamActive) {
            return Promise.resolve(null);
        }

        return new Promise((resolve, reject) => {
            const canvas = this.canvas.nativeElement,
                context = canvas.getContext('2d');

            context.drawImage(this.video.nativeElement, 0, 0, 400, 300);
            canvas.toBlob((blob: Blob) => {
                this.onBlob.emit(blob);
                resolve();
            }, 'image/png');

            this._stopStream();
        });
    }

    private _stopStream() {
        if (!this._stream) {
            return;
        }

        for (const track of this._stream.getTracks()) {
            track.stop();
        }
    }

    ngOnDestroy() {
        this._stopStream();
    }
}

