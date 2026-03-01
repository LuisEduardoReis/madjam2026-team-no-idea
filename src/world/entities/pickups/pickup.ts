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
        const s = 0.35;
        const z = s/2 + 0.05 * Math.sin(2*Math.PI*GAME.time * 0.25);
        const w = s*Math.abs(Math.sin(2*Math.PI*GAME.time * 0.5));
        drawSprite(this.world, this.texture, this.x, this.y, z, w,s);
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