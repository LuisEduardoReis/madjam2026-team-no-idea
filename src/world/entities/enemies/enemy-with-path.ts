import { WorldEntity, type WorldEntityProps } from "@src/world/entities/world-entity";
import { SpriteState } from "@src/graphics/sprite";
import { getSprite } from "@src/graphics/sprites";
import { type Point, pointDistance} from "@src/util";
import {Enemy} from "@src/world/entities/enemies/enemy";

export type EnemyWithPathProps = WorldEntityProps & {
    path: Point[];
};

export class EnemyWithPath extends Enemy {
    public spriteState: SpriteState;
    public wobble: number;

    public path: Point[];
    public pathIndex: number = 0;

    public speed: number = 1;

    constructor(props: EnemyWithPathProps) {
        super(props);

        this.path = props.path;
        this.pathIndex = 0;
        this.x = this.path[0].x;
        this.y = this.path[0].y;

        this.collidesWithOthers = true;
        this.hitScanable = true;
        this.immovable = false;
        this.radius = 0.25;

        this.spriteState = new SpriteState().setSprite(getSprite("test"));
        this.spriteState.w = 0.25;
        this.spriteState.h = 0.25;

        this.wobble = Math.random();
    }

    update(delta: number) {
        super.update(delta);

        this.spriteState.update(delta);
        this.wobble += delta;
        this.spriteState.z = 0.6 + 0.125 * Math.sin(2*Math.PI * this.wobble);

        const player = this.world?.player;
        if (!player) return;

        const target = this.path[this.pathIndex];
        const distToPathTarget = pointDistance(this.x, this.y, target.x, target.y);

        if (distToPathTarget > this.radius) {
            this.x += (target.x - this.x) / distToPathTarget * this.speed * delta;
            this.y += (target.y - this.y) / distToPathTarget * this.speed * delta;
        } else {
            this.pathIndex = (this.pathIndex + 1) % this.path.length;
        }
    }

    draw() {
        this.spriteState.drawWorld(this.world, this.x, this.y);
    }
}