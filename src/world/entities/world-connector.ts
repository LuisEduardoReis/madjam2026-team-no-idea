import { WorldEntity, type WorldEntityProps } from "@src/world/entities/world-entity";
import type { Interactable } from "@src/world/entities/interactable";
import { ControlKey, getKeyName } from "@src/input/controls";
import { SETTINGS } from "@src/settings";
import type { Point } from "@src/util";

export type WorldConnectorProps = WorldEntityProps & {
    name: string;
    targetName: string;
    direction?: number;
}

export class WorldConnector extends WorldEntity implements Interactable {

    public name: string;
    public targetName: string;
    public direction?: number;

    public targetWorld?: string;
    public targetPosition?: Point;
    public targetDirection?: number;

    constructor(props: WorldConnectorProps) {
        super(props);

        this.interactable = true;
        this.radius = 0.6;
        this.solid = false;
        this.collidesWithLevel = false;
        this.collidesWithOthers = false;

        this.name = props.name;
        this.targetName = props.targetName;
        this.direction = props.direction;
    }

    getHoverMessage(): string {
        const key = getKeyName(SETTINGS.CONTROLS[ControlKey.INTERACT]);
        return `Press '${key}' to enter`;
    }

    interact(): void {
        if (this.targetWorld && this.targetPosition) {
            this.world?.screen?.changeWorld(this.targetWorld, this.targetPosition, this.targetDirection);
        }
    }
}