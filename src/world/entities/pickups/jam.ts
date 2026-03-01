import {Pickup} from "@src/world/entities/pickups/pickup";
import type {WorldEntityProps} from "@src/world/entities/world-entity";
import {stepTo} from "@src/util";
import type {Player} from "@src/world/entities/player";
import {playSound} from "@src/audio/audio";
import {getTexture} from "@src/graphics/textures";


export class Jam extends Pickup {
    constructor(props: WorldEntityProps) {
        super(props);

        this.texture = getTexture("sprites/pickups/jam_000");
    }

    pickup(player: Player) {
        super.pickup(player);

        player.health = stepTo(player.health, player.maxHealth, Math.ceil(player.maxHealth / 3));

        this.world?.screen?.addMessage("Health recovered!");

        playSound("health-pickup");
    }
}