import { MenuItem, type MenuItemProps } from '@src/ui/items/menu_item';
import type { Point } from "@src/util";
import { getGraphics } from "@src/graphics/graphics";

export type MenuCheckboxProps = MenuItemProps & {};

export class MenuCheckbox extends MenuItem {
    public on: boolean = false;
    public setFunction: () => void = () => {};

    constructor(props: MenuCheckboxProps) {
        super(props);
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
        if (this.on) this.unset();
        else this.set();
    }

    draw() {
        const og = getGraphics().OVERLAY;
        super.draw();
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
    }
}