import { MenuItem, type MenuItemProps } from '@src/ui/items/menu_item';
import type { Point } from "@src/util";
import { getGraphics } from "@src/graphics/graphics";

export type MenuRadioButtonPros = MenuItemProps & {};

export class MenuRadioButton extends MenuItem {
    private siblings: MenuRadioButton[] = [];
    public on:boolean = false;
    public setFunction: () => void = () => {};

    constructor(props: MenuRadioButtonPros) {
        super(props);
    }

    setSiblings(siblings: MenuRadioButton[]) {
        this.siblings = siblings.filter(i => i !== this);
    }

    set() {
        this.on = true;
        this.setFunction();
    }

    unset() {
        this.on = false;
    }

    handleClick(point: Point) {
        super.handleClick(point);
        this.set();
        this.siblings.forEach(i => i.unset());
    }

    draw() {
        const og = getGraphics().OVERLAY;
        this.drawBackground();

        if (this.on) {
            og.stroke(0);
            og.strokeWeight(10);

            const cx = this.x + this.w/2;
            const cy = this.y + this.h/2;
            const cs = this.w * 0.3;
            og.line(cx - cs, cy - cs, cx + cs, cy + cs);
            og.line(cx + cs, cy - cs, cx - cs, cy + cs);

            og.noStroke();
        }
        super.draw();
    }
}