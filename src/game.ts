import { AbstractScreen } from "@src/screens/abstract-screen";
import { WorldScreen } from "@src/screens/world-screen";
import { saveSettings, SETTINGS } from "@src/settings";
import { SettingsScreen } from "@src/screens/settings-screen";
import { type Point, stepTo } from "@src/util";
import { TitleScreen } from "@src/screens/title-screen";
import { ControlsScreen } from "@src/screens/controls-screen";
import { ControlKey } from "@src/input/controls";
import { getGraphics } from "@src/graphics/graphics";
import { KEY_DOWN } from "@src/input/input";
import { updateSounds } from "@src/audio/audio";
import {PrefaceScreen} from "@src/screens/preface-screen";
import {EndgameScreen} from "@src/screens/endgame-screen";

export const FADE_IN_DELAY = 0.35;
export const FADE_OUT_DELAY = 0.35;

export type ScreenTransitionOpts = {
    fadeIn?: boolean;
    fadeOut?: boolean;
    fadeInDelay?: number;
    fadeOutDelay?: number;
}

export class Game {
    public time: number = 0;

    public screens: Map<string, AbstractScreen> = new Map<string, AbstractScreen>();
    public currentScreen: AbstractScreen | null = null;
    public previousScreen: AbstractScreen | null = null;

    public transitionTarget?: string;
    public transitionOpts?: ScreenTransitionOpts;
    public transitionTimer: number = 0;

    public fadeIn: boolean = false;
    public fadeInTimer: number = 0;
    public fadeInDelay: number = FADE_IN_DELAY;
    public fadeOut: boolean = false;
    public fadeOutTimer: number = 0;
    public fadeOutDelay: number = FADE_OUT_DELAY;

    public hasStartedPlaying: boolean = false;

    constructor() {
        this.addScreen(new WorldScreen());
        this.addScreen(new TitleScreen());
        this.addScreen(new SettingsScreen());
        this.addScreen(new ControlsScreen());
        this.addScreen(new PrefaceScreen());
        this.addScreen(new EndgameScreen());
    }

    addScreen(screen: AbstractScreen): AbstractScreen {
        this.screens.set(screen.id, screen);
        return screen;
    }

    changeScreen(newScreenId: string, opts: ScreenTransitionOpts = {}) {
        const newScreen = this.screens.get(newScreenId);
        if (!newScreen) return;

        if (opts.fadeOut !== false) {
            this.transitionTarget = newScreenId;
            this.transitionOpts = opts;
            this.transitionTimer = opts.fadeOutDelay ?? FADE_OUT_DELAY;

            this.fadeOut = true;
            this.fadeOutDelay = this.transitionTimer;
            this.fadeOutTimer = this.fadeOutDelay;
        } else {
            if (this.currentScreen) {
                this.currentScreen.hide();
                this.previousScreen = this.currentScreen;
            }

            if (opts.fadeIn !== false) {
                this.fadeIn = true;
                this.fadeInDelay = opts.fadeInDelay ?? FADE_IN_DELAY;
                this.fadeInTimer = this.fadeInDelay;
            }

            newScreen.show();
            this.currentScreen = newScreen;
        }
    }

    changePreviousScreen() {
        if (this.previousScreen) {
            this.changeScreen(this.previousScreen.id);
        } else {
            this.changeScreen(TitleScreen.ID);
        }
    }

    isTransitioningScreens(): boolean {
        return !!this.transitionTarget;
    }

    update(delta: number) {
        this.time += delta;

        updateSounds(delta);
        this.updateFadesAndTransitions(delta);

        const po = getGraphics().PIXELS_CAMERA_OFFSET;
        po.x = 0; po.y = 0;

        if (this.currentScreen && !this.isTransitioningScreens()) this.currentScreen.update(delta);
    }

    private updateFadesAndTransitions(delta: number) {
        this.fadeInTimer = stepTo(this.fadeInTimer, 0, delta);
        this.fadeOutTimer = stepTo(this.fadeOutTimer, 0, delta);
        this.transitionTimer = stepTo(this.transitionTimer, 0, delta);

        if (this.fadeIn && this.fadeInTimer === 0) {
            this.fadeIn = false;
        }

        if (this.fadeOut && this.fadeOutTimer === 0) {
            this.fadeOut = false;
        }

        if (this.transitionTarget && this.transitionOpts && this.transitionTimer === 0) {
            this.changeScreen(this.transitionTarget, {
                ...this.transitionOpts,
                fadeOut: false,
            });
            this.transitionTarget = undefined;
            this.transitionOpts = undefined;
        }
    }

    draw() {
        if (this.currentScreen) {
            this.currentScreen.draw();
        }

        const og = getGraphics().OVERLAY;
        if (this.fadeIn) {
            const alpha = (this.fadeInTimer / this.fadeInDelay);
            og.fill(0, 255 * alpha);
            og.rect(0,0, og.width, og.height);
        }
        if (this.fadeOut) {
            const alpha = 1 - (this.fadeOutTimer / this.fadeOutDelay);
            og.fill(0, 255 * alpha);
            og.rect(0,0, og.width, og.height);
        }
    }

    handleKeyPressed(keyCode: string) {
        if (this.currentScreen && !this.isTransitioningScreens()) this.currentScreen.handleKeyPressed(keyCode);

        if (KEY_DOWN.get('ShiftLeft') && keyCode === 'KeyB') {
            SETTINGS.DEBUG = !SETTINGS.DEBUG;
            saveSettings();
        }

        if (keyCode === SETTINGS.CONTROLS[ControlKey.EXIT]) {
            if (this.currentScreen?.id !== TitleScreen.ID) this.changeScreen(TitleScreen.ID);
        }
    }

    handleMousePressed(point: Point) {
        if (this.currentScreen && !this.isTransitioningScreens()) this.currentScreen.handleMousePressed(point);
    }
    handleMouseMoved(point: Point) {
        if (this.currentScreen && !this.isTransitioningScreens()) this.currentScreen.handleMouseMoved(point);
    }
    handleMouseDragged(point: Point) {
        if (this.currentScreen && !this.isTransitioningScreens()) this.currentScreen.handleMouseDragged(point);
    }
    handleMouseReleased(point: Point) {
        if (this.currentScreen && !this.isTransitioningScreens()) this.currentScreen.handleMouseReleased(point);
    }
}