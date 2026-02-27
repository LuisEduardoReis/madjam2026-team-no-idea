import { WorldConnector, type WorldConnectorProps } from "@src/world/entities/world-connector";
import type { Texture } from "@src/graphics/texture";
import { getTexture } from "@src/graphics/textures";
import { drawSprite } from "@src/graphics/sprites-renderer";
import { ControlKey, getKeyName } from "@src/input/controls";
import { SETTINGS } from "@src/settings";


export type LadderProps = WorldConnectorProps & {
    up: boolean;
}

export class Ladder extends WorldConnector {
    public up: boolean;
    public texture: Texture;

    constructor(props: LadderProps) {
        super(props);

        this.up = props.up;
        this.texture = getTexture(this.up ? "sprites/ladder_up" : "sprites/ladder_down");
    }

    draw() {
        drawSprite(this.world, this.texture, this.x, this.y, this.up ? 0.6 : 0.3, 1,1);
    }

    getHoverMessage(): string {
        const key = getKeyName(SETTINGS.CONTROLS[ControlKey.INTERACT]);
        return this.up ? `Press '${key}' to climb ladder` : `Press '${key}' to climb down ladder`;
    }
}