import { MenuItem, type MenuItemProps } from '@src/ui/items/menu_item';
import type { Point } from "@src/util";
import { getGraphics } from "@src/graphics/graphics";

export type MenuSliderProps = MenuItemProps & {
    value?: number;
};

export class MenuSlider extends MenuItem {

    public value: number;
    public onUpdateValue: (v: number) => void = (v) => {};
    public minusChar: string;
    public plusChar: string;

    constructor(props: MenuSliderProps) {
        super(props);

        this.value = props.value !== undefined ? props.value : 0.5;
        this.minusChar = '-';
        this.plusChar = '+';
    }

    handleClick(point: Point) {
        super.handleClick(point);
    }

    handleMouseDragged(point: Point) {
        super.handleMouseOver(point);
        this.value = (point.x - this.x) / this.w;
        this.onUpdateValue(this.value);
    }

    draw() {
        const og = getGraphics().OVERLAY;
        super.draw();

        og.fill(128);
        og.rect(this.x, this.y, this.w, this.h);

        const w = 10;
        const x = this.x + this.value * this.w;
        og.fill(64);
        og.rect(x - w/2, this.y, w, this.h);

        og.fill(255);
        og.textAlign('center', 'center');
        og.text(this.minusChar, this.x + 25, this.y + this.h/2);
        og.text(this.plusChar, this.x + this.w - 25, this.y + this.h/2);
    }
}