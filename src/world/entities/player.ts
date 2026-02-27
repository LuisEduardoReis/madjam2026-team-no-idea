import { WorldEntity, type WorldEntityProps } from "@src/world/entities/world-entity";
import { KEY_DOWN, KEY_PRESSED } from "@src/input/input";
import { SETTINGS } from "@src/settings";
import { angleDifference, between, pointAngle, pointDistance, randomRange, stepTo } from "@src/util";
import { getGraphics } from "@src/graphics/graphics";
import type { Interactable } from "@src/world/entities/interactable";
import { setupOverlayFont } from "@src/graphics/font";
import { ControlKey } from "@src/input/controls";
import { playSound } from "@src/audio/audio";

export const PLAYER_CAMERA_BOBBING_SPEED = 15;
export const PLAYER_CAMERA_BOBBING_AMOUNT = 0.02;

export class Player extends WorldEntity {
    public speed: number = 2.5;
    
    public currentInteractable?: Interactable;
    public hoverMessage?: string;

    public cameraShake: number = 0;
    public cameraShakeAmount: number = 50;
    public cameraShakeFadeoutDelay: number = 0.25;
    public cameraHeight: number = 0.5;
    public viewBobbingPhase: number = 0;

    constructor(props: WorldEntityProps) {
        super(props);

        this.radius = 0.35;
    }

    update(delta: number) {
        super.update(delta);

        this.movementUpdate(delta);
        this.cameraMovement(delta);
        this.interactablesUpdate();
    }

    draw() {
        const og = getGraphics().OVERLAY;

        if (this.currentInteractable) {
            setupOverlayFont(og);
            og.text(this.currentInteractable.getHoverMessage(), og.width * 0.5, og.height * 0.2);
            og.noStroke();
        }
    }

    private movementUpdate(delta: number) {
        if (KEY_DOWN.get(SETTINGS.CONTROLS[ControlKey.LOOK_LEFT])) {
            this.dir += SETTINGS.VIEW_TURN_RATE * delta;
        }
        if (KEY_DOWN.get(SETTINGS.CONTROLS[ControlKey.LOOK_RIGHT])) {
            this.dir -= SETTINGS.VIEW_TURN_RATE * delta;
        }

        let moving = false;
        const dx = Math.cos(this.dir) * this.speed * delta;
        const dy = -Math.sin(this.dir) * this.speed * delta;

        if (KEY_DOWN.get(SETTINGS.CONTROLS[ControlKey.MOVE_FORWARD])) {
            moving = true;
            this.x += dx;
            this.y += dy;
        }
        if (KEY_DOWN.get(SETTINGS.CONTROLS[ControlKey.MOVE_BACKWARD])) {
            moving = true;
            this.x -= dx;
            this.y -= dy;
        }
        if (KEY_DOWN.get(SETTINGS.CONTROLS[ControlKey.STRAFE_LEFT])) {
            moving = true;
            this.x += dy;
            this.y -= dx;
        }
        if (KEY_DOWN.get(SETTINGS.CONTROLS[ControlKey.STRAFE_RIGHT])) {
            moving = true;
            this.x -= dy;
            this.y += dx;
        }

        if (moving) {
            this.viewBobbingPhase += PLAYER_CAMERA_BOBBING_SPEED * delta;
        }
    }

    private cameraMovement(delta: number) {
        const co = getGraphics().PIXELS_CAMERA_OFFSET;
        co.x = 0;
        co.y = 0;
        this.cameraHeight = 0.5;

        if (this.cameraShake > 0) {
            this.cameraShake = stepTo(this.cameraShake, 0, delta);

            const shakeAlpha = Math.min(this.cameraShake / this.cameraShakeFadeoutDelay, 1);
            co.x = shakeAlpha * randomRange(-1, 1) * this.cameraShakeAmount;
            co.y = shakeAlpha * randomRange(-1, 1) * this.cameraShakeAmount;
        }

        if (SETTINGS.VIEW_BOBBING) {
            this.cameraHeight += PLAYER_CAMERA_BOBBING_AMOUNT * Math.sin(this.viewBobbingPhase);
        }
    }

    private interactablesUpdate() {
        this.currentInteractable = undefined;
        this.hoverMessage = undefined;

        for (const e of (this.world?.entities ?? [])) {
            if (this.currentInteractable || !e.isInteractable()) continue;

            const dist = pointDistance(this.x, this.y, e.x,e.y);
            if (!between(dist, 0.1, this.radius + e.radius + 0.2)) continue;

            const angle = Math.abs(angleDifference(this.dir, pointAngle(this.x, this.y, e.x, e.y)));
            if (angle > Math.PI/4) continue;

            this.currentInteractable = e;
            this.hoverMessage = e.getHoverMessage();
        }

        if (this.currentInteractable && KEY_PRESSED.get(SETTINGS.CONTROLS[ControlKey.INTERACT])) {
            this.currentInteractable.interact();
        }
    }
}