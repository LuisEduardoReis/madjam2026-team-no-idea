import { Sprite } from "@src/graphics/sprite";
import { getTexture } from "@src/graphics/textures";


const SPRITES = new Map<string, Sprite>();

export function getSprite(name: string): Sprite {
    const sprite = SPRITES.get(name);
    if (sprite) return sprite;

    const notAvailable = SPRITES.get("not_available");
    if (notAvailable) {
        console.warn(`Could not find sprite ${name}. Returning default sprite`);
        return notAvailable;
    }

    throw new Error(`Could not find sprite ${name}`);
}

export function initSprites() {
    SPRITES.set("not_available", new Sprite([
        getTexture("not_available"),
    ]));

    SPRITES.set("test", new Sprite([
        getTexture("sprites/test/001"),
        getTexture("sprites/test/002"),
        getTexture("sprites/test/003"),
        getTexture("sprites/test/004"),
    ]));
}