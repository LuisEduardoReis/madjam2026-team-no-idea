import { WorldEntity, type WorldEntityProps } from "@src/world/entities/world-entity";
import { KEY_DOWN, KEY_PRESSED } from "@src/input/input";
import { SETTINGS } from "@src/settings";
import {
    angleDifference,
    between,
    DEG_TO_RAD,
    hitScanEntities, map,
    point,
    pointAngle,
    pointDistance,
    randomRange,
    stepTo
} from "@src/util";
import { getGraphics } from "@src/graphics/graphics";
import type { Interactable } from "@src/world/entities/interactable";
import { setupOverlayFont } from "@src/graphics/font";
import { ControlKey } from "@src/input/controls";
import {getTexture} from "@src/graphics/textures";
import type {Texture} from "@src/graphics/texture";
import {castRay} from "@src/graphics/raycaster";
import {Enemy} from "@src/world/entities/enemies/enemy";
import {bloodSplatter} from "@src/world/entities/particles/effects";
import {SpriteState} from "@src/graphics/sprite";
import {getSprite} from "@src/graphics/sprites";

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

    public gunTexture: Texture;
    public gunFireTexture: Texture;
    public gunReloadSpriteState: SpriteState;
    public gunShootTimer: number = 0;
    public gunShootDelay: number = 0.25;
    public gunReloadTimer: number = 0;
    public gunReloadDelay: number = 0.75;

    public maxHealth = 100;
    public health = this.maxHealth;
    public hurtTimer = 0;
    public hurtDelay = 0.5;

    constructor(props: WorldEntityProps) {
        super(props);

        this.radius = 0.35;

        this.gunTexture = getTexture("sprites/gun/shotgun_000");
        this.gunFireTexture = getTexture("sprites/gun/shotgun_001");
        const gunReloadSprite = getSprite("gun-reload");
        this.gunReloadSpriteState = new SpriteState().setSprite(gunReloadSprite);
        this.gunReloadSpriteState.animationDelay = this.gunReloadDelay / gunReloadSprite.frames.length;
    }

    update(delta: number) {
        super.update(delta);

        this.movementUpdate(delta);
        this.cameraMovement(delta);
        this.gunUpdate(delta);
        this.interactablesUpdate();

        this.hurtTimer = stepTo(this.hurtTimer, 0, delta);
    }

    draw() {
        const og = getGraphics().OVERLAY;

        // Gun
        const gw = og.width / 4;
        const gx = og.width * 0.5 - gw/2 + Math.sin(this.viewBobbingPhase / 2) * gw/8;
        const gy = og.height - gw*0.9 + Math.sin(this.viewBobbingPhase) * gw/16;
        if (this.gunShootTimer > 0) {
            const knockback = this.gunShootTimer / this.gunShootDelay;
            og.image(this.gunFireTexture.raw, gx, gy + knockback*gw*0.3, gw,gw);
        } else if (this.gunReloadTimer > 0) {
            this.gunReloadSpriteState.drawOverlay(gx,gy, gw,gw);
        } else {
            og.image(this.gunTexture.raw, gx, gy, gw,gw);
        }

        // Hurt overlay
        if (this.hurtTimer > 0) {
            const alpha = map(this.hurtTimer, 0, this.hurtDelay, 0, 0.75);
            og.fill(128, 0, 0, 255*alpha);
            og.rect(0, 0, og.width, og.height);
        }

        // Healthbar
        const hbw = og.width / 6 * (this.health / this.maxHealth);
        const hbh = og.height / 24;
        og.fill(192, 0,0);
        og.rect(10, og.height - hbh - 10, hbw, hbh);

        // Interactable message
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

    private gunUpdate(delta: number) {
        this.gunShootTimer = stepTo(this.gunShootTimer, 0, delta);
        this.gunReloadTimer = stepTo(this.gunReloadTimer, 0, delta);
        this.gunReloadSpriteState.update(delta);

        if (KEY_PRESSED.get(SETTINGS.CONTROLS[ControlKey.FIRE]) && this.gunShootTimer == 0 && this.gunReloadTimer == 0) {
            this.gunShootTimer = this.gunShootDelay;
            this.gunReloadTimer = this.gunReloadDelay;
            this.gunReloadSpriteState.resetAnimation();

            const spread = 5 * DEG_TO_RAD;
            let hit = false;
            [0, -spread, spread].forEach(dirOffset => {
                if (hit) return;

                const dirX = Math.cos(this.dir + dirOffset);
                const dirY = -Math.sin(this.dir + dirOffset);
                const raycast = castRay(this.world, point(this.x, this.y), point(dirX, dirY));
                const hitscan = hitScanEntities(this.world?.entities, this.x, this.y, raycast.hit.x, raycast.hit.y);

                if (hitscan && hitscan.entity instanceof Enemy) {
                    hit = true;
                    const enemy = hitscan.entity;
                    const knockback = 10;

                    enemy.ex = dirX * knockback;
                    enemy.ey = dirY * knockback;

                    bloodSplatter(this.world, enemy.x, enemy.y, enemy.z);
                }
            });
        }
    }

    dealDamage(damage: number) {
        this.hurtTimer = this.hurtDelay;
        this.cameraShake = this.hurtDelay;
        this.health = stepTo(this.health, 0, damage);
    }
}