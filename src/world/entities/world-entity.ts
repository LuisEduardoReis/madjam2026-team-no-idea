import type { World } from "@src/world/world";
import type { Interactable } from "@src/world/entities/interactable";

export const EFFECT_FRICTION = 0.985;

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
    public ex: number;
    public ey: number;
    public eFriction: number = EFFECT_FRICTION;
    public dir: number = 0;

    public visible: boolean = true;

    public radius: number = 0.25;
    public solid: boolean = true;
    public immovable: boolean = false;
    public collidesWithLevel: boolean = true;
    public collidesWithOthers: boolean = true;
    public bumpsOthers: boolean = true;
    public hitScanable: boolean = false;

    public interactable: boolean = false;

    constructor(props: WorldEntityProps) {
        this.world = props.world;
        this.x = props.x ?? 0;
        this.y = props.y ?? 0;
        this.z = props.z ?? 0.5;
        this.px = this.x;
        this.py = this.y;
        this.ex = 0;
        this.ey = 0;
    }

    preupdate(delta: number) {
        this.px = this.x;
        this.py = this.y;
    }

    update(delta: number) {
        this.ex *= this.eFriction;
        this.ey *= this.eFriction;

        this.x += this.ex * delta;
        this.y += this.ey * delta;
    }

    draw() {}

    collideWith(other: WorldEntity) {}

    isInteractable(): this is Interactable {
        return this.interactable;
    }
}