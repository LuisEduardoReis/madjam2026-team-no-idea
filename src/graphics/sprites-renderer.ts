import { between, clamp, DEG_TO_RAD, pointDistanceSquare } from "@src/util";

import type { World } from "@src/world/world";
import { getGraphics } from "@src/graphics/graphics";
import { drawPixel, transferPixel } from "@src/graphics/pixel-util";
import { Texture } from "@src/graphics/texture";
import { Color } from "@src/types";
import { ASPECT, SETTINGS } from "@src/settings";

export function drawEntities(world: World) {
    const player = world.player;
    if (!player) return;
    
    const entitiesToDraw = world.entities.slice()
        .filter(e => e !== player)
        .sort((b, a) => pointDistanceSquare(player.x,player.y, b.x,b.y) - pointDistanceSquare(player.x,player.y, a.x,a.y));

    entitiesToDraw.forEach(entity => entity.draw());
    player.draw();
}

export type DrawSpriteOptions = {
    ignoreZBuffer?: boolean;
    tint?: Color;
}

export function drawSprite(world: World | undefined, textureOrFillColor: Texture | Color, x: number, y: number, z: number, w: number, h: number, options?: DrawSpriteOptions) {
    if (!world) return;
    const player = world.player;
    if (!player) return;

    const texture: Texture | undefined = (textureOrFillColor instanceof Texture) ? textureOrFillColor : undefined;
    const fill: Color | undefined = (textureOrFillColor instanceof Color) ? textureOrFillColor : undefined;

    const g = getGraphics();
    const pg = g.PIXELS;
    const pgWidth = pg.width;
    const pgHeight = pg.height;
    const pgPixels = pg.pixels;
    const zBuffer = g.Z_BUFFER;
    
    const cameraHeight = pgHeight * player.cameraHeight;

    const planeWidth = Math.tan(SETTINGS.FOV/2 * DEG_TO_RAD);
    const dirX = Math.cos(player.dir);
    const dirY = -Math.sin(player.dir);
    const planeX = -dirY * planeWidth / 2 * ASPECT;
    const planeY = dirX * planeWidth / 2 * ASPECT;
    const spriteX = x - player.x;
    const spriteY = y - player.y;
    const fogDistance = world.fogDistance;

    const invDet = 1.0 / (planeX * dirY - dirX * planeY);
    const transformX = invDet * (dirY * spriteX - dirX * spriteY);
    const transformY = invDet * (-planeY * spriteX + planeX * spriteY);

    if (!between(transformY, 0.01, fogDistance+0.5)) return;

    const spriteScreenX = Math.floor((pgWidth/2) * (1 + transformX / transformY));
    const levelHeight = Math.abs(Math.floor(pgHeight / transformY));
    const spriteHeight = levelHeight * h / planeWidth;
    const spriteWidth = levelHeight * w / planeWidth;

    if (spriteWidth <= 0 || spriteHeight <= 0) return;

    const spriteStartY = Math.floor(cameraHeight + levelHeight * (0.5 - z) / planeWidth - spriteHeight/2);
    const spriteStartX = Math.floor(spriteScreenX - spriteWidth/2);
    const spriteEndY = Math.floor(spriteStartY + spriteHeight);
    const spriteEndX = Math.floor(spriteStartX + spriteWidth);

    if (spriteEndX < 0 || spriteStartX > pgWidth-1 || spriteEndY < 0 || spriteStartY > pgHeight-1) return;

    const loopStartX = clamp(spriteStartX, 0, pgWidth-1);
    const loopEndX = clamp(spriteEndX, 0, pgWidth - 1);
    const loopStartY = clamp(spriteStartY, 0, pgHeight-1);
    const loopEndY = clamp(spriteEndY, 0, pgHeight - 1);

    for(let ix = loopStartX; ix <= loopEndX; ix++) {
        for(let iy = loopStartY; iy <= loopEndY; iy++) {
            if (transformY < zBuffer[ix * pgHeight + iy] || options?.ignoreZBuffer) {
                if (texture) {
                    const pos_u = (ix - spriteStartX) / spriteWidth; // pos_u = pos_u < 0 ? 0 : (pos_u > 1 ? 1 : pos_u);
                    const pos_v = (iy - spriteStartY) / spriteHeight; // pos_v = pos_u < 0 ? 0 : (pos_v > 1 ? 1 : pos_v);
                    const notTransparent = transferPixel(pgPixels, pgWidth, ix,iy, pos_u,pos_v, texture, transformY / fogDistance, world.fogColor, options?.tint);
                    if (notTransparent) zBuffer[ix * pgHeight + iy] = transformY;
                } else if (fill) {
                    drawPixel(pgPixels, pgWidth, ix,iy, fill, transformY / fogDistance, world.fogColor);
                    zBuffer[ix * pgHeight + iy] = transformY;
                }
            }
        }
    }
}
