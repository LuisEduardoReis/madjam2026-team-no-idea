import { GAME } from "@src/index";
import { windowToScreenSpace } from "@src/graphics/graphics";
import { point } from "@src/util";

export const KEY_DOWN = new Map<string, boolean>();
export const KEY_PRESSED = new Map<string, boolean>();
export const KEY_RELEASED = new Map<string, boolean>();

export function handleKeyPressed(event: KeyboardEvent) {
    if (!KEY_DOWN.has(event.code)) {
        KEY_PRESSED.set(event.code, true);

        if (GAME) GAME.handleKeyPressed(event.code);
    }

    KEY_DOWN.set(event.code, true);
}

export function handleKeyReleased(event: KeyboardEvent) {
    KEY_DOWN.delete(event.code);
    KEY_RELEASED.set(event.code, true);
}

export function handleMousePressed(event: MouseEvent) {
    if (GAME) GAME.handleMousePressed(windowToScreenSpace(point(event.x, event.y)));
}
export function handleMouseMoved(event: MouseEvent) {
    if (GAME) GAME.handleMouseMoved(windowToScreenSpace(point(event.x, event.y)));
}
export function handleMouseDragged(event: MouseEvent) {
    if (GAME) GAME.handleMouseDragged(windowToScreenSpace(point(event.x, event.y)));
}
export function handleMouseReleased(event: MouseEvent) {
    if (GAME) GAME.handleMouseReleased(windowToScreenSpace(point(event.x, event.y)));
}

export function resetInput() {
    KEY_PRESSED.clear();
    KEY_RELEASED.clear();
}