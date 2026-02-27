import {WorldEntity, type WorldEntityProps} from "@src/world/entities/world-entity";
import {clamp, map, type Point, pointDistance} from "@src/util";
import {SpriteState} from "@src/graphics/sprite";
import {getSprite} from "@src/graphics/sprites";

const MAX_SPEED = 8;
const MAX_DISTANCE_TO_PLAYER = 4;

export type RabbitProps = WorldEntityProps & {
    path: Point[];
};

export class Rabbit extends WorldEntity {
    public spriteState: SpriteState;

    public speed: number = 1;

    public path: Point[];
    public pathIndex: number;

    constructor(props: RabbitProps) {
        super(props);

        this.spriteState = new SpriteState().setSprite(getSprite("test"));

        this.path = props.path;
        this.pathIndex = 0;

        this.x = this.path[0].x;
        this.y = this.path[0].y;

        this.spriteState.z = 0.25;
    }

    update(delta: number) {
        const player = this.world?.player;
        if (!player) return;

        const target = this.path[this.pathIndex];

        const distToPlayer = pointDistance(this.x, this.y, player.x, player.y);
        const distToPathTarget = pointDistance(this.x, this.y, target.x, target.y);

        let speed = map(distToPlayer, 0, MAX_DISTANCE_TO_PLAYER, MAX_SPEED, 0);
        speed = clamp(speed, 0, MAX_SPEED);
        if (speed < 0.1) speed = 0;

        if (distToPathTarget > this.radius) {
            this.x += (target.x - this.x) / distToPathTarget * speed * delta;
            this.y += (target.y - this.y) / distToPathTarget * speed * delta;
        } else {
            this.pathIndex = (this.pathIndex + 1) % this.path.length;
        }
    }

    draw() {
        this.spriteState.draw(this.world, this.x, this.y);
    }


}