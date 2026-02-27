import type { Image } from "@src/types";


export class Texture {
    public readonly raw: Image;
    public readonly width: number;
    public readonly height: number;
    public readonly pixels: number[];

    constructor(texture: Image) {
        texture.loadPixels();

        this.raw = texture;
        this.width = texture.width;
        this.height = texture.height;
        this.pixels = texture.pixels;
    }
}