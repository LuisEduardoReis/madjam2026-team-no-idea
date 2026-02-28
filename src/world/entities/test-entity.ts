import { WorldEntity, type WorldEntityProps } from "@src/world/entities/world-entity";
import { SpriteState } from "@src/graphics/sprite";
import { getSprite } from "@src/graphics/sprites";

export class TestEntity extends WorldEntity {
    public spriteState: SpriteState;
    public testWobble: number;

    constructor(props: WorldEntityProps) {
        super(props);

        this.collidesWithOthers = true;
        this.immovable = false;
        this.radius = 0.25;

        this.spriteState = new SpriteState().setSprite(getSprite("test"));
        this.testWobble = Math.random();
    }

    update(delta: number) {
        super.update(delta);

        this.spriteState.update(delta);
        this.testWobble += delta;
        this.spriteState.z = 0.5 + 0.125 * Math.sin(2*Math.PI * this.testWobble);
    }

    draw() {
        this.spriteState.drawWorld(this.world, this.x, this.y);
    }
}