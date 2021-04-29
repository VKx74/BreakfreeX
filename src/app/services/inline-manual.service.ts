import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class InlineService {
  _window: any;

  constructor() {
    this._window = window;
  }

  createPlayer() {
    const trackingData = this._window.inlineManualPlayerData || null;
    try {
      this._window.createInlineManualPlayer(trackingData);
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
      this._window.inline_manual_player.activateTopic(id);
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