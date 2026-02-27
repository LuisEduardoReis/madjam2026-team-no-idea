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
import {EnemyWithPath} from "@src/world/entities/enemy-with-path";
import {LevelDoor} from "@src/world/entities/level-door";

export function buildWorld(name: string): World {

    const mapXml = TILED_FILES.get(name);

    if (!mapXml) {
        throw new Error(`Map file "${name}" not found`);
    }

    const mapW = mapXml.getNum("width");
    const mapH = mapXml.getNum("height");
    const tilesetXml = mapXml.getChildren("tileset")
            .find(tileset => tileset.getString("source") == "tileset.tsx")
        ?? mapXml.getChild("tileset");

    const layersByName = new Map<string, p5.XML>();
    mapXml.getChildren("layer").forEach(layer => {
        layersByName.set(layer.getString("name"), layer);
    });

    const world = new World({ w: mapW, h: mapH, name });

    loadTiles(world, layersByName, tilesetXml);
    processObjects(world, mapXml.getChildren("objectgroup")[0], mapXml);

    return world;
}

function decodeLayer(floor: p5.XML | undefined): number[] {
    if (!floor) return [];

    return decodeBase64Zlib(floor.getChild("data").getContent());
}

function loadTiles(world: World, layersByName: Map<string, p5.XML>, tilesetXml: p5.XML) {
    const firstGid = tilesetXml.getNum("firstgid");
    const floorData = decodeLayer(layersByName.get("floor"));
    const wallsData = decodeLayer(layersByName.get("walls"));
    const ceilingData = decodeLayer(layersByName.get("ceiling"));

    for(let i = 0; i < world.tiles.length; i++) {
        world.tiles[i] = new Tile({
            ceilingType: getTileTypeById(ceilingData[i] - firstGid),
            wallType: getTileTypeById(wallsData[i] - firstGid),
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
               world.player.dir = object.getNum("rotation") * DEG_TO_RAD;
               break;
           }
           case "door": {
               const tile = world.getTile(x,y);
               tile.doorType = getTileTypeById(Number(properties.get("type") ?? "0"));
               tile.doorOrientation = world.getTile(x + 1, y).isSolid() ? Orientation.VERTICAL : Orientation.HORIZONTAL;
               world.addEntity(new Door({ x: Math.floor(x) + 0.5, y: Math.floor(y) + 0.5, tile }));
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
           case "ladder": {
               const up = properties.get("up") === "true";
               const targetName = properties.get("target") ?? "<unknown>";
               const direction = object.getNum("rotation", 0) * DEG_TO_RAD;
               world.addEntity(new Ladder({ x, y, up, name, targetName, direction }));
               break;
           }
           case "rabbit-path": {
               world.addEntity(new Bunny({ path: parsePath(object, x, y, tileWidth) }));
               break;
           }
           case "bat": {
               world.addEntity(new EnemyWithPath({ path: parsePath(object, x, y, tileWidth) }));
               break;
           }
       }
    });
}

export function connectWorlds(worlds: World[]) {
    const connectors: WorldConnector[] = [];
    const connectorsByName = new Map<string, WorldConnector>();

    worlds.forEach(world => {
        world.entities
            .filter(t => t instanceof WorldConnector)
            .forEach(connector => {
                connectors.push(connector);
                connectorsByName.set(connector.name, connector);
            });
    });

    connectors.forEach(connector => {
        const target = connectorsByName.get(connector.targetName);

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