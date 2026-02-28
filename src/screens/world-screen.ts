import { AbstractScreen } from "@src/screens/abstract-screen";
import type { World } from "@src/world/world";
import { buildWorld, connectWorlds } from "@src/tiled/world-builder";
import { doLevelCollisions } from "@src/world/level-collisions";
import {point, type Point, randomRange } from "@src/util";
import { TestEntity } from "@src/world/entities/test-entity";
import { doSoftCollisions } from "@src/world/soft-collisions";
import { drawWorld } from "@src/graphics/world-renderer";
import { drawEntities } from "@src/graphics/sprites-renderer";
import { MAP_FILENAMES } from "@src/tiled/tiled";
import {p} from "@src/index";
import {WorldConnector} from "@src/world/entities/world-connector";


export class WorldScreen extends AbstractScreen {

    public static readonly ID = "WORLD_SCREEN";

    public worlds: Map<string, World> = new Map<string, World>();
    public currentWorld?: World;
    public connectorsByName = new Map<string, WorldConnector>();

    constructor() {
        super(WorldScreen.ID);

        for (const mapName of MAP_FILENAMES) this.addWorld(buildWorld(mapName));
        const worlds = Array.from(this.worlds.values());
        this.currentWorld = worlds.find(world => !!world.player);
        connectWorlds(this, worlds);
        
        // @ts-expect-error Hardcoded type
        const debugSpawn = p.getURLParams().debugSpawn as string;
        const debugSpawnConnector = this.connectorsByName.get(debugSpawn);
        if (debugSpawnConnector) {
            this.changeWorld(debugSpawnConnector?.world?.name ?? "", point(debugSpawnConnector.x, debugSpawnConnector.y));
        }
    }

    update(delta: number) {
        if (this.currentWorld) {
            this.currentWorld.entities.forEach(entity => entity.preupdate(delta));
            this.currentWorld.entities.forEach(entity => entity.update(delta));

            if (this.currentWorld.entities.some(e => e.remove)) {
                this.currentWorld.entities = this.currentWorld.entities.filter(e => !e.remove);
            }

            doSoftCollisions(this.currentWorld);
            doLevelCollisions(this.currentWorld);
        }
    }

    draw() {
        if (this.currentWorld) {
            drawWorld(this.currentWorld);
            drawEntities(this.currentWorld);
        }
    }

    addWorld(world: World): World {
        world.screen = this;
        this.worlds.set(world.name, world);
        return world;
    }

    changeWorld(worldName: string, worldPosition: Point, direction?: number) {
        const newWorld = this.worlds.get(worldName);
        const oldWorld = this.currentWorld;
        const player = this.currentWorld?.player;
        if (!newWorld || !oldWorld || !player) return;

        oldWorld.removeEntity(player);
        newWorld.addEntity(player);

        oldWorld.player = undefined;
        newWorld.player = player;

        player.x = worldPosition.x;
        player.y = worldPosition.y;
        if (direction !== undefined) player.dir = direction;

        this.currentWorld = newWorld;
    }
}