import {ChasingEnemy} from "@src/world/entities/enemies/chasing-enemy";
import type {WorldEntityProps} from "@src/world/entities/world-entity";
import {getSprite} from "@src/graphics/sprites";
import {GAME} from "@src/index";


export class Bat extends ChasingEnemy {

    constructor(props: WorldEntityProps) {
        super(props);

        this.speed = 1.75;
        this.attackDamage = this.attackDamage / 2;

        this.spriteState.w = 0.6;
        this.spriteState.h = 0.6;
        this.spriteState.z = 0.6;
        this.spriteState.animationDelay = 0.125;
        this.spriteState.setSprite(getSprite("bat"));
    }

    update(delta: number) {
        super.update(delta);
        if (!this.dead) {
            this.spriteState.z = 0.6 + 0.05 * Math.sin(2*Math.PI*GAME.time*2);
        }
    }

    kill() {
        super.kill();

        this.spriteState.z = 0.2;
        this.spriteState.setSprite(getSprite("bat-dead"));
    }
}