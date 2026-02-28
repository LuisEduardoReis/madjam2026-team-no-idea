import { WorldEntity, type WorldEntityProps } from "@src/world/entities/world-entity";
import { SpriteState } from "@src/graphics/sprite";
import { getSprite } from "@src/graphics/sprites";
import { pointDistance} from "@src/util";
import {Enemy} from "@src/world/entities/enemies/enemy";

export class ChasingEnemy extends Enemy {
    public spriteState: SpriteState;

    public speed: number = 1;

    constructor(props: WorldEntityProps) {
        super(props);

        this.collidesWithOthers = true;
        this.hitScanable = true;
        this.immovable = false;
        this.radius = 0.35;

        this.spriteState = new SpriteState().setSprite(getSprite("test"));
        this.spriteState.z = 0.25;
    }

    update(delta: number) {
        super.update(delta);

        const player = this.world?.player;
        if (!player) return;

        const distToPlayer = pointDistance(this.x, this.y, player.x, player.y);
        const bunnyIsTrapped = this.world?.bunny?.endgame && this.world.bunny.hasExitedLevel();

        if (!bunnyIsTrapped && !player.dead && !this.dead && distToPlayer > 0 && distToPlayer < 10) {
            this.spriteState.update(delta);
            this.x += (player.x - this.x) / distToPlayer * this.speed * delta;
            this.y += (player.y - this.y) / distToPlayer * this.speed * delta;
        }
    }

    draw() {
        this.spriteState.drawWorld(this.world, this.x, this.y);
    }
}