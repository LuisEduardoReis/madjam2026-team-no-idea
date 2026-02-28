import {ChasingEnemy} from "@src/world/entities/enemies/chasing-enemy";
import type {WorldEntityProps} from "@src/world/entities/world-entity";
import {getSprite} from "@src/graphics/sprites";


export class Croc extends ChasingEnemy {

    constructor(props: WorldEntityProps) {
        super(props);

        this.spriteState.w = 0.75;
        this.spriteState.h = 0.75;
        this.spriteState.z = 0.75 / 2;
        this.spriteState.animationDelay = 0.125;
        this.spriteState.setSprite(getSprite("croc"));

        this.health = 2;
    }

    kill() {
        super.kill();

        this.spriteState.setSprite(getSprite("croc-dead"));
    }
}