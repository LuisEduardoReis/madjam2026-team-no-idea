import {WorldEntity, type WorldEntityProps} from "@src/world/entities/world-entity";
import type {Sprite} from "@src/graphics/sprite";
import {getTexture} from "@src/graphics/textures";
import p5 from "p5";
import {drawSprite} from "@src/graphics/sprites-renderer";
import type {Texture} from "@src/graphics/texture";


export class Rock1 extends WorldEntity {

    public texture: Texture;

    constructor(props: WorldEntityProps) {
        super(props);

        this.collidesWithOthers = true;
        this.collidesWithLevel = false;
        this.immovable = true;
        this.radius = 0.4;

        this.texture = getTexture("sprites/rock/rock_000");
    }

    draw() {
        drawSprite(this.world, this.texture, this.x,this.y, 0.3, 0.6,0.6);
    }
}