import {WorldEntity, type WorldEntityProps} from "@src/world/entities/world-entity";
import {clamp, map, type Point, pointDistance} from "@src/util";
import {Sprite, SpriteState} from "@src/graphics/sprite";
import {getSprite} from "@src/graphics/sprites";

const MAX_SPEED = 8;
const MAX_DISTANCE_TO_PLAYER = 4;

export type BunnyProps = WorldEntityProps & {
    path: Point[];
};

export class Bunny extends WorldEntity {
    public frontSprite: Sprite;
    public backSprite: Sprite;
    public spriteState: SpriteState;

    public speed: number = 1;

    public path: Point[];
    public pathIndex: number;

    constructor(props: BunnyProps) {
        super(props);

        this.collidesWithOthers = false;

        this.frontSprite = getSprite("bunny-front");
        this.backSprite = getSprite("bunny-back");
        this.spriteState = new SpriteState().setSprite(this.frontSprite);
        this.spriteState.animationDelay = 1 / 20;

        this.path = props.path;
        this.pathIndex = 0;

        this.x = this.path[0].x;
        this.y = this.path[0].y;

        this.spriteState.z = 0.25;
    }

    update(delta: number) {
        this.spriteState.update(delta);

        const player = this.world?.player;
        if (!player) return;

        const target = this.path[this.pathIndex];

        const distToPlayer = pointDistance(this.x, this.y, player.x, player.y);
        const distToPathTarget = pointDistance(this.x, this.y, target.x, target.y);

        let speed = map(distToPlayer, 0, MAX_DISTANCE_TO_PLAYER, MAX_SPEED, 0);
        speed = clamp(speed, 0, MAX_SPEED);
        if (speed < 0.25) speed = 0;

        if (distToPathTarget > this.radius) {
            this.x += (target.x - this.x) / distToPathTarget * speed * delta;
            this.y += (target.y - this.y) / distToPathTarget * speed * delta;
        } else {
            if (this.pathIndex < this.path.length - 1) {
                this.pathIndex++;
            }
        }

        if (speed > 0.25) {
            this.spriteState.setSprite(this.backSprite);
        } else {
            this.spriteState.setSprite(this.frontSprite);
        }
    }

    draw() {
        this.spriteState.draw(this.world, this.x, this.y);
    }

    hasExitedLevel() {
        return this.pathIndex >= this.path.length - 1;
    }
}