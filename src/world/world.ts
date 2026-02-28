import { Tile } from "@src/world/tiles/tiles";
import type { WorldScreen } from "@src/screens/world-screen";
import type { WorldEntity } from "@src/world/entities/world-entity";
import type { Player } from "@src/world/entities/player";
import { Color } from "@src/types";
import {getTexture} from "@src/graphics/textures";
import type {Texture} from "@src/graphics/texture";

export type WorldProps = {
    w: number;
    h: number;
    name: string;
}

export class World {
    public readonly w: number;
    public readonly h: number;
    public readonly name: string;
    public screen?: WorldScreen;

    public readonly boundaryTile: Tile;
    public readonly tiles: Tile[];

    public entities: WorldEntity[];
    public player?: Player;

    public fogColor: Color;
    public fogDistance: number;

    public skyTexture: Texture;

    constructor(props: WorldProps) {
        this.w = props.w ?? 20;
        this.h = props.h ?? 20;
        this.name = props.name;

        this.boundaryTile = new Tile({});

        this.tiles = [];
        for(let i = 0; i < this.w * this.h; i++) {
            this.tiles.push(this.boundaryTile);
        }

        this.entities = [];

        this.fogColor = new Color(0x000000);
        this.fogDistance = 16;

        this.skyTexture = getTexture("sky");
    }

    getTile(x: number, y: number): Tile {
        if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this.boundaryTile;
        return this.tiles[Math.floor(y) * this.w + Math.floor(x)];
    }

    setTile(x: number, y: number, t: Tile) {
        if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
        this.tiles[Math.floor(y) * this.w + Math.floor(x)] = t;
    }

    addEntity<T extends WorldEntity>(entity: T): T {
        this.entities.push(entity);
        entity.world = this;
        return entity;
    }

    removeEntity<T extends WorldEntity>(entity: T): T {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
        entity.world = undefined;
        return entity;
    }

}