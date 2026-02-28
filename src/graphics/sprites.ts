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

    SPRITES.set("bunny-front", new Sprite([
        getTexture("sprites/bunny/Bunny_001"),
    ]));
    SPRITES.set("bunny-back", new Sprite([
        getTexture("sprites/bunny/Bunny_002"),
        getTexture("sprites/bunny/Bunny_002_01"),
        getTexture("sprites/bunny/Bunny_002"),
        getTexture("sprites/bunny/Bunny_002_02"),
    ]));
    SPRITES.set("gun-reload", new Sprite([
        getTexture("sprites/gun/shotgun_002"),
        getTexture("sprites/gun/shotgun_003"),
        getTexture("sprites/gun/shotgun_004"),
        getTexture("sprites/gun/shotgun_005"),
        getTexture("sprites/gun/shotgun_006"),
    ]));
    SPRITES.set("wolf", new Sprite([
        getTexture("sprites/wolf/wolf_000"),
        getTexture("sprites/wolf/wolf_001"),
    ]));
    SPRITES.set("wolf-dead", new Sprite([
        getTexture("sprites/wolf/wolf_002"),
    ]));
}