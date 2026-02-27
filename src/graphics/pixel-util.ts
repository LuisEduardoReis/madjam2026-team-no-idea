import type { Texture } from "@src/graphics/texture";
import type { Color } from "@src/types";

export function drawPixel(pixels: number[], pixelsWidth: number, x: number, y: number, p: Color, alpha?: number, mix?: Color) {
    const canvas_index = 4 * (y * pixelsWidth + x);

    if (alpha === 0 || alpha === undefined || mix === undefined) {
        pixels[canvas_index + 0] = p.r;
        pixels[canvas_index + 1] = p.g;
        pixels[canvas_index + 2] = p.b;
    } else if (alpha === 1) {
        pixels[canvas_index + 0] = mix.r;
        pixels[canvas_index + 1] = mix.g;
        pixels[canvas_index + 2] = mix.b;
    } else {
        pixels[canvas_index + 0] = p.r * (1-alpha) + mix.r * alpha;
        pixels[canvas_index + 1] = p.g * (1-alpha) + mix.g * alpha;
        pixels[canvas_index + 2] = p.b * (1-alpha) + mix.b * alpha;
    }
}

export function transferPixel(pixels: number[], pixelsWidth: number, x: number, y: number, tu: number, tv: number, texture: Texture, fogAlpha: number, fogColor: Color, tint?: Color) {

    tu = Math.floor(tu * (texture.width - 0.01));
    tv = Math.floor(tv * (texture.height - 0.01));

    const canvas_index = 4 * (y * pixelsWidth + x);
    const texture_index = 4 * (tv * texture.width + tu);
    const texture_alpha = texture.pixels[texture_index + 3];
    if (texture_alpha !== 255) return texture_alpha;

    if (fogAlpha >= 1) {
        pixels[canvas_index + 0] = fogColor.r;
        pixels[canvas_index + 1] = fogColor.g;
        pixels[canvas_index + 2] = fogColor.b;
    } else {
        let tr = texture.pixels[texture_index + 0];
        let tg = texture.pixels[texture_index + 1];
        let tb = texture.pixels[texture_index + 2];

        if (tint) {
            tr = (tr * tint.r) >> 8;
            tg = (tg * tint.g) >> 8;
            tb = (tb * tint.b) >> 8;
        }
        if (fogAlpha && fogAlpha !== 0) {
            const fogAlphaStep = Math.floor(fogAlpha * 16) * 0.0625;
            tr = tr * (1-fogAlphaStep) + fogColor.r * fogAlphaStep;
            tg = tg * (1-fogAlphaStep) + fogColor.g * fogAlphaStep;
            tb = tb * (1-fogAlphaStep) + fogColor.b * fogAlphaStep;
        }

        pixels[canvas_index + 0] = tr;
        pixels[canvas_index + 1] = tg;
        pixels[canvas_index + 2] = tb;
    }

    return 255;
}
