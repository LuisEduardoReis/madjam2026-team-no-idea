import {WorldEntity, type WorldEntityProps} from "@src/world/entities/world-entity";
import {getTexture} from "@src/graphics/textures";
import {drawSprite} from "@src/graphics/sprites-renderer";
import {GAME} from "@src/index";
import type {Texture} from "@src/graphics/texture";
import {Player} from "@src/world/entities/player";

export class Pickup extends WorldEntity {

    public texture: Texture;

    constructor(props: WorldEntityProps) {
        super(props);

        this.collidesWithLevel = false;
        this.collidesWithOthers = true;
        this.solid = false;
        this.radius = 0.125;

        this.texture = getTexture("sprites/test/001");
    }

    draw() {
        const z = 0.125 + 0.05 * Math.sin(2*Math.PI*GAME.time * 0.5);
        const w = 0.25*Math.abs(Math.sin(2*Math.PI*GAME.time));
        drawSprite(this.world, this.texture, this.x, this.y, z, w,0.25);
    }

    collideWith(other: WorldEntity) {
        if (other instanceof Player) {
            this.pickup(other);
        }
    }

    pickup(player: Player) {
        this.remove = true;
    }
}