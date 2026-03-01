import {Pickup} from "@src/world/entities/pickups/pickup";
import type {WorldEntityProps} from "@src/world/entities/world-entity";
import {stepTo} from "@src/util";
import type {Player} from "@src/world/entities/player";


export class Jam extends Pickup {
    constructor(props: WorldEntityProps) {
        super(props);

        // this.texture =
    }

    pickup(player: Player) {
        super.pickup(player);

        player.health = stepTo(player.health, player.maxHealth, Math.ceil(player.maxHealth / 3));

        this.world?.screen?.addMessage("Health recovered!");
    }
}