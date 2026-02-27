import { AbstractScreen } from "@src/screens/abstract-screen";
import type { World } from "@src/world/world";
import { buildWorld, connectWorlds } from "@src/tiled/world-builder";
import { doLevelCollisions } from "@src/world/level-collisions";
import { type Point, randomRange } from "@src/util";
import { TestEntity } from "@src/world/entities/test-entity";
import { doSoftCollisions } from "@src/world/soft-collisions";
import { drawWorld } from "@src/graphics/world-renderer";
import { drawEntities } from "@src/graphics/sprites-renderer";
import { MAP_FILENAMES } from "@src/tiled/tiled";


export class WorldScreen extends AbstractScreen {

    public static readonly ID = "WORLD_SCREEN";

    public worlds: Map<string, World> = new Map<string, World>();
    public currentWorld?: World;

    constructor() {
        super(WorldScreen.ID);

        for (const mapName of MAP_FILENAMES) this.addWorld(buildWorld(mapName));
        const worlds = Array.from(this.worlds.values());
        this.currentWorld = worlds.find(world => !!world.player);
        connectWorlds(worlds);

        // TODO Remove test code
        if (this.currentWorld) {
            for(let i = 0; i < 100; i++) {
                const x = randomRange(0, this.currentWorld.w);
                const y = randomRange(0, this.currentWorld.h);
                if (!this.currentWorld.getTile(x, y).isSolid()) {
                    this.currentWorld.addEntity(new TestEntity({ x, y }));
                }
            }
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