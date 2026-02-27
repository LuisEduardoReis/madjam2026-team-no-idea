import { stepTo } from "@src/util";
import { WorldEntity, type WorldEntityProps } from "@src/world/entities/world-entity";
import type { Tile } from "@src/world/tiles/tiles";
import type { Interactable } from "@src/world/entities/interactable";
import { SETTINGS } from "@src/settings";
import { ControlKey, getKeyName } from "@src/input/controls";

export const DOOR_OPEN_SPEED = 1 / 0.6;

export type DoorProps = WorldEntityProps & {
    tile: Tile;
}

export class Door extends WorldEntity implements Interactable {

    private tile: Tile;
    private state: number;
    public open: boolean;

    constructor(props: DoorProps) {
        super(props);

        this.visible = false;
        this.immovable = true;
        this.radius = 0.6;
        this.collidesWithOthers = true;
        this.collidesWithLevel = false;
        this.interactable = true;

        this.tile = props.tile;
        this.state = 1;
        this.open = false;
    }

    update(delta: number) {
        this.solid = !this.open;

        if (this.open) this.state = stepTo(this.state, 0.1, delta * DOOR_OPEN_SPEED);
        else this.state = stepTo(this.state, 1, delta * DOOR_OPEN_SPEED);

        this.tile.doorState = this.state;
    }

    interact(): void {
        this.open = !this.open;
    }
    getHoverMessage(): string {
        const key = getKeyName(SETTINGS.CONTROLS[ControlKey.INTERACT]);
        return !this.open ? `Press '${key}' to open door` : `Press '${key}' to close door`;
    }
}