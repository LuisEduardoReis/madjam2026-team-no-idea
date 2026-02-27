import { AbstractScreen } from "@src/screens/abstract-screen";
import type { MenuItem } from "@src/ui/items/menu_item";
import { getGraphics } from "@src/graphics/graphics";
import { SETTINGS } from "@src/settings";
import { point, type Point } from "@src/util";

export class MenuScreen extends AbstractScreen {

    public items: MenuItem[] = [];
    public mousePos: Point = point(0,0);

    show() {
        this.items.forEach(i => i.show());
    }

    update(delta: number) {
        this.items.forEach(i => i.update(delta));
    }

    draw() {
        const g = getGraphics();
        g.OVERLAY.background(0);
        this.items.forEach(i => i.draw());

        if (SETTINGS.DEBUG) this.items.forEach(i => i.drawDebug());
    }

    addItem<T extends MenuItem>(item: T): T {
        item.screen = this;
        this.items.push(item);
        return item;
    }

    handleMousePressed(point: Point) {
        this.mousePos = point;
        this.items.filter(i => i.isMouseOver()).forEach(i => i.handleClick(point));
    }

    handleMouseMoved(point: Point) {
        this.mousePos = point;
        this.items.filter(i => i.isMouseOver()).forEach(i => i.handleMouseOver(point));
    }
    handleMouseDragged(point: Point) {
        this.mousePos = point;
        this.items.filter(i => i.isMouseOver()).forEach(i => i.handleMouseDragged(point));
    }
}