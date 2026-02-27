import { WorldEntity, type WorldEntityProps } from "@src/world/entities/world-entity";
import { Color } from "@src/types";
import { drawSprite } from "@src/graphics/sprites-renderer";
import { clamp } from "@src/util";

export type ParticleProps = WorldEntityProps & {
    color?: Color;
    lifetime?: number;
    w?: number;
    h?: number;
    vx?: number;
    vy?: number;
    vz?: number;
};

export class Particle extends WorldEntity {

    public t: number = 0;
    public lifetime: number;
    public color: Color;
    public w: number;
    public h: number;

    public g: number = 3;
    public vx: number;
    public vy: number;
    public vz: number;

    constructor(props: ParticleProps) {
        super(props);

        this.solid = false;
        this.collidesWithOthers = false;
        this.collidesWithLevel = true;
        this.radius = 0.01;

        this.color = props.color ?? new Color(0xff00ff);
        this.lifetime = props.lifetime ?? 1;
        this.w = props.w ?? 0.05;
        this.h = props.h ?? this.w;

        this.vx = props.vx ?? 0;
        this.vy = props.vy ?? 0;
        this.vz = props.vz ?? 0;
    }

    update(delta: number) {
        super.update(delta);

        this.t += delta;
        if (this.t > this.lifetime) {
            this.remove = true;
        }

        this.vz -= this.g * delta;
        this.x += this.vx * delta;
        this.y += this.vy * delta;
        this.z += this.vz * delta;
        this.z = clamp(this.z, 0,1);
        if (this.z == 0 || this.z == 1) {
            this.vx = 0;
            this.vy = 0;
            this.vz = 0;
        }
    }

    draw() {
        drawSprite(this.world, this.color, this.x, this.y, this.z, this.w, this.h);
    }
}