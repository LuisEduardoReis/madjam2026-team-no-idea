import type { Point } from "@src/util";

export class AbstractScreen {

    public readonly id: string;
    public timer: number = 0;

    constructor(id: string) {
        this.id = id;
    }

    show() {
        this.timer = 0;
    }
    hide() {}

    update(delta: number) {
        this.timer += delta;
    }
    draw() {}

    handleKeyPressed(keyCode: string) {}
    handleMousePressed(point: Point) {}
    handleMouseMoved(point: Point) {}
    handleMouseDragged(point: Point) {}
    handleMouseReleased(point: Point) {}
}