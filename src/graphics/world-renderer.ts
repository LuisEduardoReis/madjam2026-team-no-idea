import type { World } from "@src/world/world";
import { getGraphics } from "@src/graphics/graphics";
import { castRay } from "@src/graphics/raycaster";
import { clamp, DEG_TO_RAD, point } from "@src/util";
import { drawPixel, transferPixel } from "@src/graphics/pixel-util";
import { ASPECT, SETTINGS } from "@src/settings";

export function drawWorld(world: World) {

    const g = getGraphics();
    const pg = g.PIXELS;
    const zBuffer = g.Z_BUFFER;
    const player = world.player;
    const pgWidth = pg.width;
    const pgHeight = pg.height;
    const pgPixels = pg.pixels;

    if (!player) return;

    const planeWidth = Math.tan(SETTINGS.FOV/2 * DEG_TO_RAD);
    const invPlaneWidth = 1 / planeWidth;
    const dirX = Math.cos(player.dir);
    const dirY = -Math.sin(player.dir);
    const planeX = -dirY * planeWidth/2 * ASPECT;
    const planeY = dirX * planeWidth/2 * ASPECT;
    const fogDistance = world.fogDistance;
    const invFogDistance = 1 / fogDistance;
    const invPgHeight = 1 / pgWidth;

    for(let i = 0; i < pgWidth * pgHeight; i++) {
        zBuffer[i] = fogDistance;
    }

    const cameraHeight = pgHeight * player.cameraHeight;
    const horizonLine = pgHeight / 2;

    for(let x = 0; x < pgWidth; x++) {
        const cameraX = 2 * x / pgWidth - 1; //x-coordinate in camera space
        const rayDirX = dirX + planeX * cameraX;
        const rayDirY = dirY + planeY * cameraX;

        const raycast = castRay(world, point(player.x, player.y), point(rayDirX, rayDirY));

        const wallHeight = pgHeight / raycast.distance * invPlaneWidth;
        const invWallHeight = 1 / wallHeight;
        const wallStartY = Math.floor(cameraHeight - wallHeight * 0.5);
        const wallEndY = Math.floor(cameraHeight + wallHeight * 0.5) + 1;
        const skyU = 1 - (Math.atan2(rayDirX,rayDirY) + Math.PI) / (2*Math.PI);

        // Ceiling
        for (let y = 0; y < wallStartY; y++) {
            const ceilDist = (1 - horizonLine) / (y - cameraHeight) * invPlaneWidth;
            if (ceilDist < 0) continue;

            const pos_x = player.x + ceilDist * rayDirX;
            const pos_y = player.y + ceilDist * rayDirY;
            const cx = Math.floor(pos_x);
            const cy = Math.floor(pos_y);

            const pos_u = 1 - (pos_x - cx);
            const pos_v = pos_y - cy;
            const tile = world.getTile(pos_x, pos_y);
            const texture = tile.ceilingType?.texture;
            if (texture) {
                transferPixel(pgPixels, pgWidth, x, y, pos_u, pos_v, texture, ceilDist * invFogDistance, world.fogColor);
            } else if (world.skyTexture) {
                const skyV = y * invPgHeight * 4;
                if (skyV <= 1) {
                    transferPixel(pgPixels, pgWidth, x,y, skyU, skyV, world.skyTexture, 0, world.fogColor);
                } else {
                    drawPixel(pgPixels, pgWidth, x, y, world.fogColor);
                }
            }
        }

        // Wall
        for (let y = wallStartY; y < wallEndY; y++) {
            if (y < 0 || y >= pgHeight) continue;
            const hit_v = clamp((y - wallStartY) * invWallHeight, 0, 1);
            const tile = world.getTile(raycast.hit.x, raycast.hit.y);
            const wall_u = raycast.hit_u;

            const texture = raycast.door ? tile.doorType?.texture : tile.wallType?.texture;
            if (texture) {
                const fogAlpha = raycast.distance * invFogDistance;
                transferPixel(pgPixels, pgWidth, x, y, wall_u, hit_v, texture, fogAlpha, world.fogColor);
                zBuffer[x * pgHeight + y] = raycast.distance;
            }
        }

        // Floor
        for (let y = wallEndY; y < pgHeight; y++) {
            const floorDist = (horizonLine - 1) / (y - cameraHeight) * invPlaneWidth;
            if (floorDist < 0) continue;
            const pos_x = player.x + floorDist * rayDirX;
            const pos_y = player.y + floorDist * rayDirY;
            const cx = Math.floor(pos_x);
            const cy = Math.floor(pos_y);

            const pos_u = pos_x - cx;
            const pos_v = pos_y - cy;
            const tile = world.getTile(pos_x, pos_y);
            const texture = tile.floorType?.texture;
            if (texture) {
                transferPixel(pgPixels, pgWidth, x, y, pos_u, pos_v, texture, floorDist * invFogDistance, world.fogColor);
            } else {
                drawPixel(pgPixels, pgWidth, x, y, world.fogColor);
            }

            /*
            let isDark = ((cx & 1) === 0) !== ((cy & 1) === 0);
            drawPixel(pgPixels, pgWidth, x,y, isDark ? 0 : 0xffffff, floorDist * invFogDistance, 0);
            */
        }
    }
}