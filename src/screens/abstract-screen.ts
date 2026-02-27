import type { Point } from "@src/util";

export class AbstractScreen {

    public readonly id: string;

    constructor(id: string) {
        this.id = id;
    }

    show() {}
    hide() {}

    update(delta: number) {}
    draw() {}

    handleKeyPressed(keyCode: string) {}
    handleMousePressed(point: Point) {}
    handleMouseMoved(point: Point) {}
    handleMouseDragged(point: Point) {}
    handleMouseReleased(point: Point) {}
}