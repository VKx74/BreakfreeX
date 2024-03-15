import {Component, OnDestroy, AfterViewInit} from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import {ThemeService} from "@app/services/theme.service";
import { AuthRoutes } from "modules/Auth/auth.routes";
import sketch from '../../../../assets/p5-sketch'; // Replace with the actual path to your p5-sketch.js file.

declare var p5: any;

@Component({
    selector: 'auth-root',
    templateUrl: 'auth-root.component.html',
    styleUrls: ['auth-root.component.scss', '../../styles/_shared.scss']
})
export class AuthRootComponent implements AfterViewInit, OnDestroy {
    showVideo = false;
   // private p5Instance: any;

    constructor(private _themeService: ThemeService, private router: Router) {
        router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                const nav = val as NavigationEnd;
                if (nav.url && nav.url.endsWith(`/${AuthRoutes.Registration}`)) {
                    this.showVideo = true;
                } else {
                    this.showVideo = false;
                }
            }
        });
    }

    ngAfterViewInit() {
        // Attempt to autoplay the video muted as a backup solution
        this.autoplayVideoMuted();
    }

    ngOnDestroy() {
     //   this.p5Instance.remove();
    }
   
    private autoplayVideoMuted(): void {
        const myVideo = document.getElementById('myVideo') as HTMLVideoElement;
        if (myVideo) {
            myVideo.muted = true; // Ensure it's muted
            myVideo.play()
                .catch(error => console.error("Video play failed:", error));
        }
    }
}
