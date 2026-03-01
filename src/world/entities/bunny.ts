import {WorldEntity, type WorldEntityProps} from "@src/world/entities/world-entity";
import {clamp, map, type Point, pointDistance, stepTo} from "@src/util";
import {Sprite, SpriteState} from "@src/graphics/sprite";
import {getSprite} from "@src/graphics/sprites";
import type {Interactable} from "@src/world/entities/interactable";
import {ControlKey, getKeyName} from "@src/input/controls";
import {SETTINGS} from "@src/settings";
import {EndgameScreen} from "@src/screens/endgame-screen";
import {GAME} from "@src/index";

const MAX_SPEED = 8;
const MAX_DISTANCE_TO_PLAYER = 4;

export type BunnyProps = WorldEntityProps & {
    path: Point[];
    endgame?: boolean;
};

export class Bunny extends WorldEntity implements Interactable {
    public frontSprite: Sprite;
    public backSprite: Sprite;
    public endgameSprite: Sprite;
    public spriteState: SpriteState;

    public speed: number = 1;

    public path: Point[];
    public pathIndex: number;

    public endgame: boolean;

    public vz: number = 0;
    public g: number = 5;


    constructor(props: BunnyProps) {
        super(props);

        this.collidesWithLevel = false;
        this.collidesWithOthers = false;
        this.hitScanable = true;

        this.frontSprite = getSprite("bunny-front");
        this.backSprite = getSprite("bunny-back");
        this.endgameSprite = getSprite("bunny-endgame");
        this.spriteState = new SpriteState().setSprite(this.frontSprite);
        this.spriteState.animationDelay = 1 / 20;

        this.path = props.path;
        this.pathIndex = 0;

        this.endgame = props.endgame ?? false;

        this.x = this.path[0].x;
        this.y = this.path[0].y;

        this.z = this.spriteState.z = 0.25;
    }

    update(delta: number) {
        this.spriteState.update(delta);

        this.vz -= this.g * delta;
        this.z += this.vz * delta;
        if (this.z < 0.25) {
            this.z = 0.25;
            this.vz = 0;
        }
        this.spriteState.z = this.z;

        const player = this.world?.player;
        if (!player) return;

        let speed = 0;
        if (this.pathIndex < this.path.length) {
            const target = this.path[this.pathIndex];

            const distToPlayer = pointDistance(this.x, this.y, player.x, player.y);
            const distToPathTarget = pointDistance(this.x, this.y, target.x, target.y);

            speed = map(distToPlayer, 0, MAX_DISTANCE_TO_PLAYER, MAX_SPEED, 0);
            speed = clamp(speed, 0, MAX_SPEED);
            if (speed < 0.25) speed = 0;

            if (distToPathTarget > this.radius) {
                this.x += (target.x - this.x) / distToPathTarget * speed * delta;
                this.y += (target.y - this.y) / distToPathTarget * speed * delta;
            } else {
                this.pathIndex++;
            }
        }

        if (this.pathIndex >= this.path.length && this.endgame) {
            this.spriteState.setSprite(this.endgameSprite);
            this.immovable = true;
            this.collidesWithOthers = true;
            this.interactable = true;
            this.radius = 0.9;
        } else if (speed > 0.25) {
            this.spriteState.setSprite(this.backSprite);
        } else {
            this.spriteState.setSprite(this.frontSprite);
        }
    }

    draw() {
        this.spriteState.drawWorld(this.world, this.x, this.y);
    }

    hasExitedLevel() {
        return this.pathIndex >= this.path.length - 1;
    }

    getHoverMessage(): string {
        const key = getKeyName(SETTINGS.CONTROLS[ControlKey.INTERACT]);
        return `Press '${key}' to capture the rabbit`;
    }
    interact(): void {
        if (this.endgame) {
            GAME.changeScreen(EndgameScreen.ID, { fadeOutDelay: 2, fadeInDelay: 3 });
        }
    }
}