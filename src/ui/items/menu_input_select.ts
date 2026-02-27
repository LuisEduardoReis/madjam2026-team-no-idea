import { MenuLabel, type MenuLabelProps } from '@src/ui/items/menu_label';
import { type ControlKey, getKeyName } from "@src/input/controls";
import { SETTINGS } from "@src/settings";
import { getGraphics } from "@src/graphics/graphics";
import { GAME } from "@src/index";

export type MenuInputSelectProps = MenuLabelProps;

export class MenuInputSelect extends MenuLabel {

    public key?: ControlKey;
    public selected: boolean = false;

    constructor(props: MenuInputSelectProps) {
        super(props);
    }

    updateText() {
        if (this.key) {
            this.text = getKeyName(SETTINGS.CONTROLS[this.key]);
        }
    }

    draw() {
        const og = getGraphics().OVERLAY;

        if (this.selected) {
            if (GAME.time % 0.5 < 0.25) og.fill(255);
            else og.fill(128);
        } else {
            if (this.isMouseOver()) og.fill(255);
            else og.fill(128);
        }

        og.rect(this.x, this.y, this.w, this.h);

        super.draw();
    }
}