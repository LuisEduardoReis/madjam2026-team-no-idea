import { AbstractScreen } from "@src/screens/abstract-screen";
import type { World } from "@src/world/world";
import { buildWorld, connectWorlds } from "@src/tiled/world-builder";
import { doLevelCollisions } from "@src/world/level-collisions";
import {map, point, type Point, randomRange, stepTo} from "@src/util";
import { TestEntity } from "@src/world/entities/test-entity";
import { doSoftCollisions } from "@src/world/soft-collisions";
import { drawWorld } from "@src/graphics/world-renderer";
import { drawEntities } from "@src/graphics/sprites-renderer";
import { MAP_FILENAMES } from "@src/tiled/tiled";
import {p} from "@src/index";
import {WorldConnector} from "@src/world/entities/world-connector";
import {pauseSound, playSound, SOUNDS} from "@src/audio/audio";
import {SETTINGS} from "@src/settings";
import {getGraphics} from "@src/graphics/graphics";
import {setupOverlayFont} from "@src/graphics/font";


export class WorldScreen extends AbstractScreen {

    public static readonly ID = "WORLD_SCREEN";

    public worlds: Map<string, World> = new Map<string, World>();
    public currentWorld?: World;
    public connectorsByName = new Map<string, WorldConnector>();

    public messages: string[] = [];
    public currentMessage: string | undefined;
    public messageTimer: number = 0;
    public messageDelay: number = 2;

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
            this.changeWorld(debugSpawnConnector?.world?.name ?? "", point(debugSpawnConnector.x, debugSpawnConnector.y), debugSpawnConnector.direction);
        }

        // TODO debug
        this.addMessage("Catch that rabbit!");
    }

    show() {
        if (SETTINGS.MUSIC) {
            SOUNDS.get("theme")?.instance.stop();
            SOUNDS.get("theme")?.play(1);
        }
    }

    hide() {
        if (SETTINGS.MUSIC) SOUNDS.get("theme")?.instance.fade(1, 0, 500);
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

        this.messageTimer = stepTo(this.messageTimer, 0, delta);
        if (this.messageTimer == 0) {
            if (this.messages.length > 0) {
                this.currentMessage = this.messages.pop();
                this.messageTimer = this.messageDelay;
            } else {
                this.currentMessage = undefined;
            }
        }
    }

    draw() {
        if (this.currentWorld) {
            drawWorld(this.currentWorld);
            drawEntities(this.currentWorld);
        }

        if (this.currentMessage) {
            const og = getGraphics().OVERLAY;
            let messageAlpha = 1;
            const fadeTime = 0.5;
            if (this.messageTimer < fadeTime) { messageAlpha = map(this.messageTimer, 0,fadeTime, 0,1); }
            if (this.messageTimer > this.messageDelay - fadeTime) { messageAlpha = map(this.messageTimer, this.messageDelay -fadeTime,this.messageDelay, 1,0); }
            setupOverlayFont(og, 60, messageAlpha);
            og.textAlign("center");
            og.text(this.currentMessage, og.width/2, og.height/4);
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

    addMessage(message: string) {
        this.messages.push(message);
    }
}