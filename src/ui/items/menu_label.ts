import { MenuItem, type MenuItemProps } from '@src/ui/items/menu_item';
import { getGraphics } from "@src/graphics/graphics";
import type { HorizontalAlign, VerticalAlign } from "@src/types";

export type MenuLabelProps = MenuItemProps & {
    text?: string;
    textColor?: number;
    fontSize?: number;
    alignHorizontal?: HorizontalAlign;
    alignVertical?: VerticalAlign;
}

export class MenuLabel extends MenuItem {
    public text: string;
    public textColor: number;
    public fontSize: number;

    public alignHorizontal: HorizontalAlign;
    public alignVertical: VerticalAlign;

    constructor(props: MenuLabelProps) {
        super(props);

        this.text = props.text ?? "";
        this.textColor = props.textColor ?? 0xffffff;
        this.fontSize = props.fontSize ?? 40;
        this.alignHorizontal = props.alignHorizontal ?? 'left';
        this.alignVertical = props.alignVertical ?? 'top';
    }

    draw(){
        super.draw();
        const g = getGraphics();

        g.OVERLAY.fill(this.textColor);
        g.OVERLAY.noStroke();
        g.OVERLAY.textSize(this.fontSize);
        g.OVERLAY.textAlign(this.alignHorizontal, this.alignVertical);
        let x = this.x;
        let y = this.y;
        if (this.alignVertical === 'center') y += this.h / 2;
        if (this.alignHorizontal === 'center') x += this.w / 2;
        g.OVERLAY.text(this.text, x, y);
    }
}