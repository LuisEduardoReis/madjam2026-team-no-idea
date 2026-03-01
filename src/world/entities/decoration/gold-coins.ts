import {WorldEntity, type WorldEntityProps} from "@src/world/entities/world-entity";
import {getTexture} from "@src/graphics/textures";
import {drawSprite} from "@src/graphics/sprites-renderer";
import type {Texture} from "@src/graphics/texture";
import {randomRange} from "@src/util";


export class GoldCoins extends WorldEntity {

    public texture: Texture;

    constructor(props: WorldEntityProps) {
        super(props);

        this.x += randomRange(-0.25, 0.25);
        this.y += randomRange(-0.25, 0.25);

        this.collidesWithOthers = false;
        this.collidesWithLevel = false;

        this.texture = getTexture("sprites/gold/gold_000");
    }

    draw() {
        drawSprite(this.world, this.texture, this.x,this.y, 0.2, 0.5,0.5);
    }
}