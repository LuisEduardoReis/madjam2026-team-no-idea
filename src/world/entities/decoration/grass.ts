import {WorldEntity, type WorldEntityProps} from "@src/world/entities/world-entity";
import {getTexture} from "@src/graphics/textures";
import {drawSprite} from "@src/graphics/sprites-renderer";
import type {Texture} from "@src/graphics/texture";


export class Grass extends WorldEntity {

    public texture: Texture;

    constructor(props: WorldEntityProps) {
        super(props);

        this.collidesWithOthers = false;
        this.collidesWithLevel = false;

        this.texture = getTexture("sprites/grass/grass_001");
    }

    draw() {
        drawSprite(this.world, this.texture, this.x,this.y, 0.5, 1,1);
    }
}