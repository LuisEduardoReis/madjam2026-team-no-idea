import { p } from "@src/index";
import type { Image } from "@src/types";
import type { PackedTexturesData } from "@src/graphics/types";
import texturesConfigJson from "@assets/textures-config.json";
import { TILED_FILES } from "@src/tiled/tiled";
import { Texture } from "@src/graphics/texture";

let RAW_TEXTURES: Image | undefined = undefined;
const TEXTURES = new Map<string, Texture>();

export async function loadTextures() {
    RAW_TEXTURES = await p.loadImage("assets/textures.png");
}

export function initTextures() {
    const rawTextures = RAW_TEXTURES;

    if (!rawTextures) {
        throw new Error("Textures file not loaded");
    }

    const texturesConfig: PackedTexturesData = texturesConfigJson;
    texturesConfig.frames.forEach(({ frame, filename }) => {
        const name = filename.split(".")[0];
        TEXTURES.set(name, new Texture(rawTextures.get(frame.x, frame.y, frame.w, frame.h)));
    });

    console.log(TEXTURES);

    initTileTextures();
}

export function getTexture(name: string): Texture {
    const texture = TEXTURES.get(name);
    if (texture) {
        return texture;
    }

    const notAvailableTexture = TEXTURES.get('not_available');
    if (notAvailableTexture) {
        console.warn(`Texture "${name}" not found. Returning default texture`);
        return notAvailableTexture;
    }

    throw new Error(`Texture "${name}" not found`);
}

export const TILE_TEXTURES = new Map<string, Texture>();

function initTileTextures() {
    const tilesetTexture = TEXTURES.get("tiles/tileset");
    const tilesetXml = TILED_FILES.get("tileset");

    if (!tilesetXml) {
        throw new Error("Tileset file not found");
    }
    if (!tilesetTexture) {
        throw new Error("Tileset texture not found");
    }

    const tileWidth = tilesetXml.getNum("tilewidth");
    const tileHeight = tilesetXml.getNum("tileheight");
    const tilesetSize = tilesetXml.getNum("tilecount");
    const tilesetColumns = tilesetXml.getNum("columns");
    for(let i = 0; i < tilesetSize; i++) {
        const id = String(i);
        const x = i % tilesetColumns;
        const y = Math.floor(i / tilesetColumns);
        const tileTexture = tilesetTexture.raw.get(x * tileWidth, y * tileHeight, tileWidth, tileHeight);

        TILE_TEXTURES.set(id, new Texture(tileTexture));
    }
}
