import { TILED_FILES } from "@src/tiled/tiled";
import p5 from "p5";
import { getTexture, TILE_TEXTURES } from "@src/graphics/textures";
import type { Texture } from "@src/graphics/texture";
import { Orientation } from "@src/util";

export type TileProps = {
    ceilingType?: TileType;
    wallType?: TileType;
    floorType?: TileType;
}

export class Tile {
    public ceilingType?: TileType;
    public wallType?: TileType;
    public floorType?: TileType;
    public doorType?: TileType;

    public doorOrientation: Orientation = Orientation.HORIZONTAL;
    public doorState: number = 1;

    constructor(props: TileProps) {
        this.ceilingType = props.ceilingType;
        this.wallType = props.wallType;
        this.floorType = props.floorType;
        this.doorType = undefined;
    }

    isSolid() {
        return !!this.wallType;
    }

    isDoor() {
        return !!this.doorType;
    }
}

export type TileTypeProps = {
    id: string;
    texture?: Texture;
}

export class TileType {
    public readonly id: string;
    public texture: Texture | undefined;

    constructor(props: TileTypeProps) {
        this.id = props.id;
        this.texture = props.texture;
    }
}

export const TILE_TYPES = new Map<string, TileType>();
export const EMPTY_TILE_TYPE = new TileType({
    id: "EMPTY",
});
export const UNKNOWN_TILE_TYPE = new TileType({
    id: "UNKNOWN",
});

export type TileXMLProperties = Map<string, string>;

export function initTiles() {
    const tilesetXml = TILED_FILES.get("tileset");

    if (!tilesetXml) {
        console.error("Tileset file not found");
        return;
    }

    const tilesetCount = tilesetXml.getNum("tilecount");
    const tileXmlById = new Map<string, p5.XML>();
    const tilePropertiesById = new Map<string, TileXMLProperties>();

    tilesetXml.getChildren("tile").forEach(tileXml => {
        const id = tileXml.getString("id");
        const props: TileXMLProperties = new Map<string, string>();

        tileXml.getChild("properties").getChildren("property").forEach(propertyXml => {
           props.set(propertyXml.getString("name"), propertyXml.getString("value"));
        });

        tileXmlById.set(id, tileXml);
        tilePropertiesById.set(id, props);
    });

    for(let i = 0; i < tilesetCount; i++) {
        const id = String(i);
        const props = tilePropertiesById.get(id);
        const type = new TileType({
            id,
            texture: TILE_TEXTURES.get(id),
        });
        TILE_TYPES.set(id, type);
    }

    TILE_TYPES.set(EMPTY_TILE_TYPE.id, EMPTY_TILE_TYPE);
    UNKNOWN_TILE_TYPE.texture = getTexture("not_available");
}