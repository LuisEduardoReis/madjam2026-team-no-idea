import { MenuLabel, type MenuLabelProps } from '@src/ui/items/menu_label';
import type {Texture} from "@src/graphics/texture";
import {getGraphics} from "@src/graphics/graphics";

export type MenuButtonProps = MenuLabelProps & {
    texture?: Texture;
};

export class MenuButton extends MenuLabel {
    public texture: Texture | undefined;

    constructor(props: MenuButtonProps) {
        super(props);

        this.texture = props.texture;
    }

    draw() {
        if (this.texture) {
            const og = getGraphics().OVERLAY;
            if (this.isMouseOver()) og.tint(192);
            og.image(this.texture.raw, this.x, this.y, this.w, this.h);
            og.noTint();
        } else {
            this.drawBackground();
        }
        super.draw();
    }
}