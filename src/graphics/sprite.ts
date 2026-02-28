import type { Texture } from "@src/graphics/texture";
import { stepTo } from "@src/util";
import { drawSprite } from "@src/graphics/sprites-renderer";
import type { World } from "@src/world/world";
import {getGraphics} from "@src/graphics/graphics";


export class Sprite {
    public frames: Texture[];

    constructor(frames: Texture[]) {
        this.frames = frames;
    }
}

export class SpriteState {

    public sprite?: Sprite;

    public w: number = 0.5;
    public h: number = 0.5;
    public z: number = 0.5;

    public animationTimer: number = 0;
    public animationDelay: number = 0.5;
    public animationIndex: number = 0;

    constructor() {}

    setSprite(sprite: Sprite): SpriteState {
        this.sprite = sprite;
        this.animationIndex = this.animationIndex % sprite.frames.length;
        return this;
    }

    update(delta: number) {
        if (this.sprite) {
            this.animationTimer = stepTo(this.animationTimer, 0, delta);
            if (this.animationTimer === 0) {
                this.animationTimer = this.animationDelay;
                this.animationIndex = (this.animationIndex + 1) % this.sprite.frames.length;
            }
        }
    }

    drawWorld(world: World | undefined, x: number, y: number) {
        if (world && this.sprite) {
            const frame = this.sprite.frames[this.animationIndex];

            drawSprite(world, frame, x,y, this.z, this.w, this.h);
        }
    }

    drawOverlay(x: number, y: number, w: number, h: number) {
        if (this.sprite) {
            const og = getGraphics().OVERLAY;
            const frame = this.sprite.frames[this.animationIndex];

            og.image(frame.raw, x,y,w,h);
        }
    }

    resetAnimation() {
        this.animationIndex = 0;
        this.animationTimer = 0;
    }
}