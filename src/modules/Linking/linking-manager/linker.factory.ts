import {Linker} from "./linker";
import {LinkingMessagesBus} from "../services";
import {Injectable} from "@angular/core";

@Injectable()
export class LinkerFactory {
    constructor(private _linkingMessagesBus: LinkingMessagesBus) {
    }

    getLinker() {
        return new Linker(this._linkingMessagesBus);
    }
}