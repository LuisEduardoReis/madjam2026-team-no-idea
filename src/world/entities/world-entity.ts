import type { World } from "@src/world/world";
import type { Interactable } from "@src/world/entities/interactable";

export type WorldEntityProps = {
    x?: number;
    y?: number;
    z?: number;
    world?: World;
}

export class WorldEntity {
    public world?: World;
    public remove: boolean = false;

    public x: number;
    public y: number;
    public z: number;
    public px: number;
    public py: number;
    public dir: number = 0;

    public visible: boolean = true;

    public radius: number = 0.25;
    public solid: boolean = true;
    public immovable: boolean = false;
    public collidesWithLevel: boolean = true;
    public collidesWithOthers: boolean = true;

    public interactable: boolean = false;

    constructor(props: WorldEntityProps) {
        this.world = props.world;
        this.x = props.x ?? 0;
        this.y = props.y ?? 0;
        this.z = props.z ?? 0.5;
        this.px = this.x;
        this.py = this.y;
    }

    preupdate(delta: number) {
        this.px = this.x;
        this.py = this.y;
    }

    update(delta: number) {}

    draw() {}

    collideWith(other: WorldEntity) {}

    isInteractable(): this is Interactable {
        return this.interactable;
    }
}