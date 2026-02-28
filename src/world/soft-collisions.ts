import type { World } from "@src/world/world";
import { pointDistance } from "@src/util";


export function doSoftCollisions(world: World) {
    world.entities.forEach((e) => {
       if (!e.collidesWithOthers || e.immovable) {
           return;
       }

       world.entities.forEach((o) => {
           if (e === o) return;
           if (!o.collidesWithOthers) return;
           if (Math.abs(e.x-o.x) + Math.abs(e.y-o.y) > 2) return;

           const dist = pointDistance(e.x, e.y, o.x, o.y);
           const overlap = e.radius + o.radius - dist;

           if (overlap >= 0) {
                e.collideWith(o);

               if (e.solid && o.solid && dist != 0) {
                   const vx = (e.x - o.x) / dist;
                   const vy = (e.y - o.y) / dist;
                   e.x += vx * overlap * 0.5;
                   e.y += vy * overlap * 0.5;
               }
           }
       });
    });
}