import { Howl }from 'howler';
import { stepTo } from "@src/util";


export const SOUNDS = new Map<string, Sound>();

const DEFAULT_SOUND_COOLDOWN = 0.05;

export class Sound {
    instance: Howl;

    public cooldownTimer = 0;
    public cooldownDelay = DEFAULT_SOUND_COOLDOWN;

    constructor(file: string, loop: boolean = false) {
        this.instance = new Howl({
            src: [file],
            loop,
        });
    }

    update(delta: number) {
        this.cooldownTimer = stepTo(this.cooldownTimer, 0, delta);
    }

    play(vol: number) {
        if (this.cooldownTimer == 0) {
            this.instance.volume(vol);
            this.instance.play();
            this.cooldownTimer = this.cooldownDelay;
        }
    }

    pause() {
        this.instance.pause();
    }
}

export function loadAudio() {
    SOUNDS.set("test", new Sound("assets/audio/test.wav"));
    SOUNDS.set("theme", new Sound("assets/audio/theme.wav", true));
}

export function updateSounds(delta: number) {
   SOUNDS.forEach((sound) => sound.update(delta));
}

export function playSound(soundId: string, vol?: number) {
    vol = vol ?? 1;
    const sound = SOUNDS.get(soundId);

    if (sound) {
        sound.instance.stop();
        sound.play(vol);
    }
}

export function pauseSound(soundId: string) {
    const sound = SOUNDS.get(soundId);

    if (sound) sound.instance.fade(1, 0, 500);
}

/*export function playSoundAtPos(sound,x,y,z,minVol,maxVol,minDist,maxDist) {
    if (!muted && sound.cooldown == 0) {
        let dist = pointDistance3d(x,y,z, player.x,player.y,player.z)
        let vol = p.map(dist, minDist,maxDist, maxVol, minVol, true)
        if (vol > 0) {
            sound.play(vol)
        }
        sound.cooldown = sound.cooldownDelay
    }
}*/
