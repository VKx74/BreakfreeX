import {Injectable} from "@angular/core";


const soundPathes = {
    'Alert1': './assets/sounds/Alert1.wav',
    'Alert2': './assets/sounds/Alert2.wav',
    'Alert3': './assets/sounds/Alert3.wav',
    'Alert4': './assets/sounds/Alert4.wav',
    'Alert5': './assets/sounds/Alert5.wav',
    'Alert6': './assets/sounds/Alert6.wav',
    'Alert7': './assets/sounds/Alert7.wav',
    'Alert8': './assets/sounds/Alert8.wav',
    'Alert9': './assets/sounds/Alert9.wav'
};

@Injectable()
export class AudioService {

    get sounds(): string[] {
        return Object.getOwnPropertyNames(soundPathes);
    }

    public playSound(soundId: string) {
        if (soundPathes[soundId]) {
            const audio = new Audio(soundPathes[soundId]);
            audio.load();

            try {
                audio.play();
            } catch (e) {
                setTimeout(() => {
                    audio.play();
                }, 3000);
            }
        }
    }
}