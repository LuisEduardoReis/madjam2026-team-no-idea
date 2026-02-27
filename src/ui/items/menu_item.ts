import { getGraphics } from "@src/graphics/graphics";
import { betweenRect, type Point } from "@src/util";
import type { SettingsScreen } from "@src/screens/settings-screen";
import type { MenuScreen } from "@src/screens/menu-screen";

export type MenuItemProps = {
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    onShow?: () => void;
    onClickFunction?: () => void;
}

export class MenuItem {
    public screen?: MenuScreen;
    public x: number;
    public y: number;
    public w: number;
    public h: number;
    public link?: MenuItem;
    public onShow: () => void;
    public onClickFunction: () => void;


    constructor(props: MenuItemProps) {
        this.x = props.x ?? 0;
        this.y = props.y ?? 0;
        this.w = props.w ?? 0;
        this.h = props.h ?? 0;

        this.onShow = props.onShow ?? (() => {});
        this.onClickFunction = props.onClickFunction ?? (() => {});
    }

    show() {
        this.onShow();
    }

    update(delta: number) {

    }

    draw() {}

    drawDebug() {
        const g = getGraphics();

        g.OVERLAY.stroke(255,0,0);
        g.OVERLAY.strokeWeight(4);
        g.OVERLAY.noFill();
        g.OVERLAY.rect(this.x, this.y, this.w, this.h);
        g.OVERLAY.noStroke();
    }

    drawBackground() {
        const og = getGraphics().OVERLAY;

        if (this.isMouseOver()) {
            og.fill(255);
        } else {
            og.fill(128);
        }
        og.rect(this.x, this.y, this.w, this.h);
    }

    handleClick(point: Point) {
        this.onClickFunction();
        if (this.link) this.link.handleClick(point);
    }

    handleMouseOver(point: Point) {}
    handleMouseDragged(point: Point) {}

    isMouseOver() {
        return betweenRect(this.screen?.mousePos.x ?? 0, this.screen?.mousePos.y ?? 0, this.x, this.y, this.w, this.h);
    }
}