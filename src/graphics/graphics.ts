import { CANVAS, p } from "@src/index";
import { ASPECT, OVERLAY_RESOLUTION, PIXELS_RESOLUTIONS, RESOLUTION, saveSettings, SETTINGS } from "@src/settings";
import type p5 from "p5";
import { clamp, point, type Point } from "@src/util";
import { getFont } from "@src/graphics/font";

type Graphics = {
    MAIN: p5.Graphics;
    OVERLAY: p5.Graphics;
    PIXELS: p5.Image;
    PIXELS_CAMERA_OFFSET: Point;
    Z_BUFFER: number[];
}

let GRAPHICS: Graphics | null = null;

export function getCanvasSize(): { w: number, h: number } {
    let w,h;

    if (p.windowWidth / p.windowHeight > ASPECT) {
        h = p.windowHeight;
        w = p.windowHeight * ASPECT;
    } else {
        w = p.windowWidth;
        h = p.windowWidth / ASPECT;
    }

    return {
        w: Math.floor(w),
        h: Math.floor(h)
    };
}

export function disableSmoothTextures(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (context) {
        //context.mozImageSmoothingEnabled = false;
        //context.webkitImageSmoothingEnabled = false;
        //context.msImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;
    }
}

export function buildGraphics() {
    GRAPHICS = {
        MAIN: p.createGraphics(RESOLUTION.w, RESOLUTION.h),
        OVERLAY: p.createGraphics(OVERLAY_RESOLUTION.w, OVERLAY_RESOLUTION.h),
        PIXELS: p.createImage(0,0),
        PIXELS_CAMERA_OFFSET: point(0,0),
        Z_BUFFER: []
    };

    GRAPHICS.MAIN.pixelDensity(1);
    GRAPHICS.OVERLAY.pixelDensity(1);

    GRAPHICS.MAIN.textFont(getFont());
    GRAPHICS.OVERLAY.textFont(getFont());

    disableSmoothTextures(GRAPHICS.MAIN.elt);
    disableSmoothTextures(GRAPHICS.OVERLAY.elt);
    setResolution(SETTINGS.CURRENT_PIXELS_RESOLUTION);
}

export function setResolution(resolutionIndex: number) {
    if (!GRAPHICS) return;

    const i = clamp(resolutionIndex, 0, PIXELS_RESOLUTIONS.length-1);
    const r= PIXELS_RESOLUTIONS[i];
    console.log(`Setting resolution ${r.w}x${r.h}`);
    SETTINGS.CURRENT_PIXELS_RESOLUTION = i;
    saveSettings();

    GRAPHICS.PIXELS = p.createImage(r.w, r.h);
    GRAPHICS.PIXELS.loadPixels();
    GRAPHICS.Z_BUFFER = [];

    for(let i = 0; i < 4 * GRAPHICS.PIXELS.width * GRAPHICS.PIXELS.height; i++) {
        GRAPHICS.PIXELS.pixels[i] = 255;
    }

    for(let i = 0; i < GRAPHICS.PIXELS.width * GRAPHICS.PIXELS.height; i++) {
        GRAPHICS.Z_BUFFER.push(0);
    }
}


export function getGraphics(): Graphics {
    if (!GRAPHICS) {
        throw new Error("Graphics haven't been initialized");
    }

    return GRAPHICS;
}

export function windowToScreenSpace(windowPoint: Point): Point {
    const cp = CANVAS.elt.getBoundingClientRect();
    return {
        x: Math.floor((windowPoint.x - cp.x) / p.width * RESOLUTION.w),
        y: Math.floor((windowPoint.y - cp.y) / p.height * RESOLUTION.h),
    };
}
