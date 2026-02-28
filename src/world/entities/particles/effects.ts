import type { World } from "@src/world/world";
import {Particle} from "@src/world/entities/particle";
import {randomRange} from "@src/util";
import {Color} from "@src/types";

const bloodColor = new Color(0x800000);

export function bloodSplatter(world: World | undefined, x: number, y: number, z: number) {

    const count = 25;
    const offset = 0.15;
    for(let i = 0; i < count; ++i) {
        const particle = new Particle({
            x: x + randomRange(-offset, offset), y: y + randomRange(-offset, offset), z: z + randomRange(-offset, offset),
            vz: randomRange(0.5,1), vx: randomRange(-1, 1), vy: randomRange(-1, 1),
            color: bloodColor,
        });
        world?.addEntity(particle);
    }
}