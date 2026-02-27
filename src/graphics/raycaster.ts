import {
    between,
    clamp,
    lineIntersectionToHorizontalAxis,
    lineIntersectionToVerticalAxis,
    Orientation,
    point,
    type Point
} from '@src/util';
import type { World } from "@src/world/world";
import type { Tile } from "@src/world/tiles/tiles";


export type RaycastResult = {
    distance: number;
    hit: Point;
    hit_u: number;
    normal: Point;
    door: boolean;
}

const invalidRayCastResult: RaycastResult = {
    distance: 0,
    hit: point(0,0),
    hit_u: 0,
    normal: point(0,0),
    door: false,
};

export function castRay(world: World | undefined, origin: Point, ray: Point, checkSolidFunction?: (t: Tile) => boolean): RaycastResult {
    if (!world) return invalidRayCastResult;

    checkSolidFunction ||= e => e.isSolid();

    let mapX = Math.floor(origin.x);
    let mapY = Math.floor(origin.y);
    let sideDistX, sideDistY, stepX, stepY;
    let hit = false;
    let side = false;
    let door = false;
    let tile: Tile | undefined;

    const deltaDistX = (ray.x === 0) ? Number.POSITIVE_INFINITY : Math.abs(1 / ray.x);
    const deltaDistY = (ray.y === 0) ? Number.POSITIVE_INFINITY : Math.abs(1 / ray.y);

    if (ray.x < 0) {
        stepX = -1;
        sideDistX = (origin.x - mapX) * deltaDistX;
    } else {
        stepX = 1;
        sideDistX = (mapX + 1.0 - origin.x) * deltaDistX;
    } if (ray.y < 0) {
        stepY = -1;
        sideDistY = (origin.y - mapY) * deltaDistY;
    } else {
        stepY = 1;
        sideDistY = (mapY + 1.0 - origin.y) * deltaDistY;
    }
    for (let i = 0; i < 100 && !hit; i++) {
        //Jump to next map square, either in x-direction, or in y-direction
        if (sideDistX < sideDistY) {
            sideDistX += deltaDistX;
            mapX += stepX;
            side = false;
        } else {
            sideDistY += deltaDistY;
            mapY += stepY;
            side = true;
        }

        //Check if ray has hit a wall
        tile = world.getTile(mapX, mapY);
        if (checkSolidFunction(tile)) hit = true;

        //If the ray hits a wall, do a single check for the line of the door
        if (tile.isDoor()) {
            if (tile.doorOrientation === Orientation.VERTICAL) {
                const intersectionX = lineIntersectionToHorizontalAxis(origin.x, origin.y, ray.x, ray.y, mapY + 0.5);
                if (between(intersectionX, mapX, mapX + tile.doorState)) {
                    hit = true;
                    door = true;
                    sideDistY += deltaDistY * 0.5;
                }
            } else {
                const intersectionY = lineIntersectionToVerticalAxis(origin.x, origin.y, ray.x, ray.y, mapX + 0.5);
                if (between(intersectionY, mapY, mapY + tile.doorState)) {
                    hit = true;
                    door = true;
                    sideDistX += deltaDistX * 0.5;
                }
            }
        }
    }

    let perpWallDist;
    if(!side) perpWallDist = (sideDistX - deltaDistX);
    else perpWallDist = (sideDistY - deltaDistY);

    const hit_x = origin.x + (perpWallDist+0.000001) * ray.x;
    const hit_y = origin.y + (perpWallDist+0.000001) * ray.y;

    let hit_u = 0;
    if (side && stepY < 0) hit_u = hit_x - Math.floor(hit_x);
    else if (side && stepY > 0) hit_u = 1 - (hit_x - Math.floor(hit_x));
    else if (!side && stepX > 0) hit_u = hit_y - Math.floor(hit_y);
    else if (!side && stepX < 0) hit_u = 1 - (hit_y - Math.floor(hit_y));

    let normal_x, normal_y;
    if (!side) {
        normal_y = 0;
        normal_x = -Math.sign(stepX);
    } else {
        normal_y = -Math.sign(stepY);
        normal_x = 0;
    }

    if (tile && door) {
        const s = tile.doorState;
        if ((side && stepY < 0) || (!side && stepX > 0)) hit_u = clamp(hit_u + 1 - s, 0,1);
        else if ((side && stepY > 0) || (!side && stepX < 0)) hit_u = clamp(hit_u + s - 1, 0,1);
    }

    return {
        distance: perpWallDist,
        hit: point(hit_x, hit_y),
        hit_u,
        normal: point(normal_x, normal_y),
        door,
    };
}