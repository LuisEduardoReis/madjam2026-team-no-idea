import { Howl }from 'howler';
import { stepTo } from "@src/util";


export const SOUNDS = new Map<string, SoundEffect>();

const DEFAULT_SOUND_COOLDOWN = 0.05;

export class SoundEffect {
    private instance: Howl;

    public cooldownTimer = 0;
    public cooldownDelay = DEFAULT_SOUND_COOLDOWN;

    constructor(file: string) {
        this.instance = new Howl({
            src: [file]
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
}

export function loadAudio() {
    SOUNDS.set("test", new SoundEffect("assets/audio/test.wav"));
}

export function updateSounds(delta: number) {
   SOUNDS.forEach((sound) => sound.update(delta));
}

export function playSound(soundId: string, vol?: number) {
    vol = vol ?? 1;
    const sound = SOUNDS.get(soundId);

    if (sound) sound.play(vol);
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
