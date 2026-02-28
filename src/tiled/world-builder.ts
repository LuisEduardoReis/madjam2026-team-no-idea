import {World} from "@src/world/world";
import {decodeBase64Zlib, TILED_FILES} from "@src/tiled/tiled";
import {Tile, TILE_TYPES, UNKNOWN_TILE_TYPE} from "@src/world/tiles/tiles";
import p5 from "p5";
import {Player} from "@src/world/entities/player";
import {DEG_TO_RAD, Orientation, type Point, point} from "@src/util";
import {Door} from "@src/world/entities/door";
import {WorldConnector} from "@src/world/entities/world-connector";
import {Ladder} from "@src/world/entities/ladder";
import {Bunny} from "@src/world/entities/bunny";
import {EnemyWithPath} from "@src/world/entities/enemies/enemy-with-path";
import {LevelDoor} from "@src/world/entities/level-door";
import {ChasingEnemy} from "@src/world/entities/enemies/chasing-enemy";
import {Tree} from "@src/world/entities/decoration/tree";
import type {WorldScreen} from "@src/screens/world-screen";
import {Wolf} from "@src/world/entities/enemies/wolf";
import {Croc} from "@src/world/entities/enemies/croc";
import {Grass} from "@src/world/entities/decoration/grass";
import {SawGrass} from "@src/world/entities/decoration/saw-grass";
import {Spider} from "@src/world/entities/enemies/spider";
import {Rock1} from "@src/world/entities/decoration/rock1";
import {Rock2} from "@src/world/entities/decoration/rock2";

export function buildWorld(name: string): World {

    const tilesetXml = TILED_FILES.get("tileset");
    const mapXml = TILED_FILES.get(name);

    if (!tilesetXml) {
        throw new Error(`Tileset XML not found`);
    }
    if (!mapXml) {
        throw new Error(`Map file "${name}" not found`);
    }

    const mapW = mapXml.getNum("width");
    const mapH = mapXml.getNum("height");
    const mapTilesetXml = mapXml.getChildren("tileset")
            .find(tileset => tileset.getString("source") == "tileset.tsx")
        ?? mapXml.getChild("tileset");

    const layersByName = new Map<string, p5.XML>();
    mapXml.getChildren("layer").forEach(layer => {
        layersByName.set(layer.getString("name"), layer);
    });

    const world = new World({ w: mapW, h: mapH, name });

    loadTiles(world, layersByName, mapTilesetXml, tilesetXml);
    processObjects(world, mapXml.getChildren("objectgroup")[0], mapXml);

    return world;
}

function decodeLayer(floor: p5.XML | undefined): number[] {
    if (!floor) return [];

    return decodeBase64Zlib(floor.getChild("data").getContent());
}

function loadTiles(world: World, layersByName: Map<string, p5.XML>, mapTilesetXml: p5.XML, tilesetXml: p5.XML) {
    const firstGid = mapTilesetXml.getNum("firstgid");
    const floorData = decodeLayer(layersByName.get("floor"));
    const wallsData = decodeLayer(layersByName.get("walls"));
    const ceilingData = decodeLayer(layersByName.get("ceiling"));
    const tileEntityIds = new Map<number, string>();

    tilesetXml.getChildren("tile").forEach(tileXml => {
        const id = tileXml.getString("id");
       tileXml.getChild("properties").getChildren("property").forEach(tileProperty => {
           const name = tileProperty.getString("name");
           const value = tileProperty.getString("value");
           if (name === "tile-entity") tileEntityIds.set(Number(id), value);
       });
    });

    for(let i = 0; i < world.tiles.length; i++) {
        const x = i % world.w;
        const y = Math.floor(i / world.w);
        const wallId = wallsData[i] - firstGid;
        const tileEntityId = tileEntityIds.get(wallId);
        const wallType = !tileEntityId ? getTileTypeById(wallId) : undefined;

        if (tileEntityId === "tree") world.addEntity(new Tree({ x: x + 0.5, y: y + 0.5 }));
        if (tileEntityId === "grass") world.addEntity(new Grass({ x: x + 0.5, y: y + 0.5 }));
        if (tileEntityId === "saw-grass") world.addEntity(new SawGrass({ x: x + 0.5, y: y + 0.5 }));
        if (tileEntityId === "rock1") world.addEntity(new Rock1({ x: x + 0.5, y: y + 0.5 }));
        if (tileEntityId === "rock2") world.addEntity(new Rock2({ x: x + 0.5, y: y + 0.5 }));

        world.tiles[i] = new Tile({
            ceilingType: getTileTypeById(ceilingData[i] - firstGid),
            wallType,
            floorType: getTileTypeById(floorData[i] - firstGid),
        });
    }
}

function getTileTypeById(id: number) {
    if (id < 0) return undefined;

    const tileType = TILE_TYPES.get(String(id));
    if (tileType) {
        return tileType;
    } else {
        return UNKNOWN_TILE_TYPE;
    }
}

function processObjects(world: World, objectGroup: p5.XML, mapXml: p5.XML) {
    const tileWidth = mapXml.getNum("tilewidth");

    objectGroup.getChildren("object").forEach(object => {
       const name = object.getString("name");
       const type = object.getString("class") || object.getString("type");
       const x= object.getNum("x") / tileWidth;
       const y= object.getNum("y") / tileWidth;
       const properties = new Map<string, string>();
       (object.getChild("properties")?.getChildren("property") ?? [])
            .forEach((property) => properties.set(property.getString("name"), property.getString("value")));

       switch (type) {
           case "spawn": {
               world.player = world.addEntity(new Player({ x, y }));
               world.player.dir = (object.getNum("rotation", 0) + 1) * DEG_TO_RAD;
               break;
           }
           case "door":
           case "closed-door": {
               const tile = world.getTile(x,y);
               tile.doorType = getTileTypeById(Number(properties.get("type") ?? "0"));
               tile.doorOrientation = world.getTile(x + 1, y).isSolid() ? Orientation.VERTICAL : Orientation.HORIZONTAL;
               const openable = type !== "closed-door";
               world.addEntity(new Door({ x: Math.floor(x) + 0.5, y: Math.floor(y) + 0.5, tile, openable }));
               break;
           }
           case "level-door": {
               const tile = world.getTile(x,y);
               const targetName = properties.get("target") ?? "<unknown>";
               tile.doorType = getTileTypeById(Number(properties.get("type") ?? "0"));
               tile.doorOrientation = world.getTile(x + 1, y).isSolid() ? Orientation.VERTICAL : Orientation.HORIZONTAL;
               tile.doorState = 1;
               world.addEntity(new LevelDoor({ x: Math.floor(x) + 0.5, y: Math.floor(y) + 0.5, name, targetName }));
               break;
           }
           case "level-spawn": {
               const spawn = new WorldConnector({ x: Math.floor(x) + 0.5, y: Math.floor(y) + 0.5, name, interactable: false });
               spawn.direction = (object.getNum("rotation", 0) + 1) * DEG_TO_RAD;
               world.addEntity(spawn);
               break;
           }
           case "ladder": {
               const up = properties.get("up") === "true";
               const targetName = properties.get("target") ?? "<unknown>";
               const direction = (object.getNum("rotation", 0) + 1) * DEG_TO_RAD;
               world.addEntity(new Ladder({ x, y, up, name, targetName, direction }));
               break;
           }
           case "bunny-path": {
               const bunny = new Bunny({ path: parsePath(object, x, y, tileWidth) });
               world.bunny = bunny;
               world.addEntity(bunny);
               break;
           }
           case "bat": {
               world.addEntity(new EnemyWithPath({ path: parsePath(object, x, y, tileWidth) }));
               break;
           }
           case "hare":
           case "wolf": {
               world.addEntity(new Wolf({ x, y }));
               break;
           }
           case "croc": {
               world.addEntity(new Croc({ x, y }));
               break;
           }
           case "spider": {
               world.addEntity(new Spider({ x, y }));
               break;
           }
       }
    });
}

export function connectWorlds(screen: WorldScreen, worlds: World[]) {
    const connectors: WorldConnector[] = [];

    worlds.forEach(world => {
        world.entities
            .filter(t => t instanceof WorldConnector)
            .forEach(connector => {
                connectors.push(connector);
                screen.connectorsByName.set(connector.name, connector);
            });
    });

    connectors.forEach(connector => {
        if (!connector.targetName) return;

        const target = screen.connectorsByName.get(connector.targetName);

        if (!target) {
            console.warn(`Connector "${connector.name} has invalid target "${connector.targetName}"`);
            return;
        }

        connector.targetWorld = target.world?.name;
        connector.targetPosition = point(target.x, target.y);
        connector.targetDirection = target.direction;
    });
}

function parsePath(object: p5.XML, x: number, y: number, tileWidth: number): Point[] {
    const pointsData = object.getChild(0).getString("points");
    return pointsData.split(" ").map(pointData => {
        const numbers = pointData.split(",");
        return point(x + Number(numbers[0]) / tileWidth, y + Number(numbers[1]) / tileWidth);
    });
}