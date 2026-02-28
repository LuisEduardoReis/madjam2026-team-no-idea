import type { World } from "@src/world/world";


export function doLevelCollisions(world: World) {
    world.entities.forEach((e) => {
       if (!e.collidesWithLevel) {
           return;
       }

        if (world.getTile(e.x, e.y).isSolid()) {
            e.x = e.px;
            e.y = e.py;
            e.ex = 0; e.ey = 0;
        }

        if (world.getTile(e.x + e.radius,e.y).isSolid()) {
            e.x = Math.floor(e.x) + 1 - e.radius;
            e.ex = 0; e.ey = 0;
        }
        if (world.getTile(e.x - e.radius,e.y).isSolid()) {
            e.x = Math.floor(e.x) + e.radius;
            e.ex = 0; e.ey = 0;
        }
        if (world.getTile(e.x, e.y + e.radius).isSolid()) {
            e.y = Math.floor(e.y) + 1 - e.radius;
            e.ex = 0; e.ey = 0;
        }
        if (world.getTile(e.x, e.y - e.radius).isSolid()) {
            e.y = Math.floor(e.y) + e.radius;
            e.ex = 0; e.ey = 0;
        }
    });
}