import { Injectable } from "@angular/core";
import { create } from "domain";
import { IdentityService } from "./auth/identity.service";

@Injectable({
  providedIn: 'root'
})
export class InlineService {
  _window: any;
  private _created: boolean = false;

  constructor(private _identityService: IdentityService) {
    this._window = window;
  }

  track(): void {
    let userCreated = 0;
    if (!!this._identityService.artifSubExp) {
      userCreated = this._identityService.artifSubExp - 172800;
    }
    if (!userCreated || userCreated <= 0) {
      userCreated = 1;
    }
    this._window.inlineManualTracking = {
      uid: this._identityService.id,
      created: userCreated
    };
    this.createPlayer();
  }

  createPlayer() {
    const trackingData = this._window.inlineManualPlayerData || null;
    try {
      // console.log("try createPlayer");
      this._window.createInlineManualPlayer(trackingData);
      console.log("createPlayer");
      // console.log(trackingData);
    } catch (error) {
      console.error(error);
    }
  }

  updatePlayer() {
    if (!this._window.inline_manual_player) { return; }
    try {
      this._window.inline_manual_player.update();
    } catch (error) {
      console.error(error);
    }
  }

  activateTopic(id: string) {
    try {
      if (this._window.inline_manual_player) {
        this._window.inline_manual_player.activateTopic(id);
        this._window.inline_manual_player.deactivate(id);
      } else
        console.log('im player instance not found');
    } catch (error) {
      console.error(error);
    }
  }

  showPanel() {
    try {
      this._window.inline_manual_player.showPanel();
    } catch (error) {
      console.error(error);
    }
  }

}