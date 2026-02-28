import type { Interactable } from "@src/world/entities/interactable";
import {WorldConnector, type WorldConnectorProps} from "@src/world/entities/world-connector";

export class LevelDoor extends WorldConnector implements Interactable {

    constructor(props: WorldConnectorProps) {
        super(props);

        this.solid = true;
        this.immovable = true;
        this.collidesWithOthers = true;
    }

    update(delta: number) {
        super.update(delta);

        this.interactable = this.world?.bunny?.hasExitedLevel() ?? false;
    }
}