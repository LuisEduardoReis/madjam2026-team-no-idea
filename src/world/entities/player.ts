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
    pointDistance, RAD_TO_DEG,
    randomRange, randomRangeInt,
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
import {GAME} from "@src/index";
import {playSound} from "@src/audio/audio";

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
    public healthRegenSpeed = this.maxHealth / 30;
    public hurtTimer = 0;
    public hurtDelay = 0.5;

    public dead = false;
    public deathTimer = 0;

    public arrowTexture: Texture;

    constructor(props: WorldEntityProps) {
        super(props);

        this.radius = 0.35;

        this.gunTexture = getTexture("sprites/gun/shotgun_000");
        this.gunFireTexture = getTexture("sprites/gun/shotgun_001");
        const gunReloadSprite = getSprite("gun-reload");
        this.gunReloadSpriteState = new SpriteState().setSprite(gunReloadSprite);
        this.gunReloadSpriteState.animationDelay = this.gunReloadDelay / gunReloadSprite.frames.length;

        this.arrowTexture = getTexture("sprites/arrow");
    }

    update(delta: number) {
        super.update(delta);

        this.cameraMovement(delta);

        this.hurtTimer = stepTo(this.hurtTimer, 0, delta);
        if (!this.dead) {
            if (this.health <= 0) this.die();
            //this.health = stepTo(this.health, this.maxHealth, this.healthRegenSpeed * delta);

            this.movementUpdate(delta);
            this.gunUpdate(delta);
            this.interactablesUpdate();
        } else {
            this.deathTimer += delta;
            this.ex = 0;
            this.ey = 0;
        }
    }

    draw() {
        const og = getGraphics().OVERLAY;

        // Gun
        const gw = og.width / 4;
        const gx = og.width * 0.5 - gw/2 + Math.sin(this.viewBobbingPhase / 2) * gw/8;
        const gy = og.height - gw*0.9 + Math.sin(this.viewBobbingPhase)*gw/16 + 2*this.deathTimer*gw;
        if (this.gunShootTimer > 0) {
            const knockback = this.gunShootTimer / this.gunShootDelay;
            og.image(this.gunFireTexture.raw, gx, gy + knockback*gw*0.3, gw,gw);
        } else if (this.gunReloadTimer > 0) {
            this.gunReloadSpriteState.drawOverlay(gx,gy, gw,gw);
        } else {
            og.image(this.gunTexture.raw, gx, gy, gw,gw);
        }

        // Hurt overlay
        og.noStroke();
        if (this.hurtTimer > 0) {
            const alpha = map(this.hurtTimer, 0, this.hurtDelay, 0, 0.75);
            og.fill(128, 0, 0, 255*alpha);
            og.rect(0, 0, og.width, og.height);
        } else if (this.healthCritical() && !this.dead) {
            const alpha = map(Math.sin(2*Math.PI*GAME.time), -1, 1, 0.25, 0.5);
            og.fill(128, 0, 0, 255*alpha);
            og.rect(0, 0, og.width, og.height);
        }

        // Healthbar
        const hbw = og.width / 6 * (this.health / this.maxHealth);
        const hbh = og.height / 24;
        const hbx = 10;
        const hby = og.height - hbh - 10 + (this.healthCritical() && GAME.time % 0.5 < 0.25 ? -hbh/2 : 0 );
        og.noStroke();
        og.fill(192, 0,0);
        og.rect(hbx, hby, hbw, hbh);

        // Interactable message
        if (this.currentInteractable) {
            setupOverlayFont(og);
            og.text(this.currentInteractable.getHoverMessage(), og.width * 0.5, og.height * 0.2);
            og.noStroke();
        }

        // Bunny pointer
        const bunny = this.world?.bunny;
        if (bunny) {
            const dirToBunny = pointAngle(this.x, this.y, bunny.x, bunny.y);
            const diff = RAD_TO_DEG * angleDifference(dirToBunny, this.dir);
            const aw = 64;
            if (diff < -SETTINGS.FOV/2) {
                og.push();
                og.translate(aw/2, og.height/2 + aw/2 + Math.sin(10*GAME.time) * aw/2);
                og.scale(-1, 1);
                og.image(this.arrowTexture.raw, -aw/2, -aw/2, aw,aw);
                og.pop();
            }
            if (diff > SETTINGS.FOV/2) {
                og.push();
                og.translate(og.width - aw/2, og.height/2 + aw/2 + Math.sin(10*GAME.time) * aw/2);
                og.image(this.arrowTexture.raw, -aw/2, -aw/2, aw,aw);
                og.pop();
            }
        }

        // Death screen
        if (this.dead) {
            og.fill(192, 0,0, 128);
            og.rect(0, 0, og.width, og.height);

            const youDiedAlpha = map(this.deathTimer, 2,4, 0,1, true);
            if (youDiedAlpha > 0) {
                setupOverlayFont(og, 100, youDiedAlpha);
                og.textAlign("center");
                og.text("You died", og.width/2, og.height/3);
            }

            if (this.deathTimer > 4 && GAME.time % 1 < 0.5) {
                setupOverlayFont(og, 60);
                og.textAlign("center");
                og.text("Refresh to play again", og.width/2, og.height*0.75);
            }
        }
    }

    private healthCritical() {
        return this.health / this.maxHealth < 0.35;
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

        if (this.dead) {
            this.cameraHeight = map(this.deathTimer, 0,0.5, 0.5, 0.1, true);
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

            playSound("shotgun1");

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
                    const knockback = 1;

                    enemy.ex = dirX * knockback;
                    enemy.ey = dirY * knockback;
                    enemy.damage();

                    bloodSplatter(this.world, enemy.x, enemy.y, enemy.z);
                }
            });
        }
    }

    dealDamage(damage: number) {
        if (!this.dead) {
            this.hurtTimer = this.hurtDelay;
            this.cameraShake = this.hurtDelay;
            this.health = stepTo(this.health, 0, damage);
            playSound("hurt");
        }
    }

    die() {
        this.dead = true;
        this.immovable = true;
    }
}