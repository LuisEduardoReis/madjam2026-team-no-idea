import { type ControlKey, DEFAULT_KEYS } from "@src/input/controls";

export const FPS = 60;

export const ASPECT = 16 / 9;

const WIDTH = 1920;
export const RESOLUTION = { w: WIDTH, h: Math.floor(WIDTH / ASPECT) };

const OVERLAY_WIDTH = WIDTH;
export const OVERLAY_RESOLUTION = { w: OVERLAY_WIDTH, h: Math.floor(OVERLAY_WIDTH / ASPECT) };

const PIXELS_WIDTHS = [160, 240, 320, 480, 640];
export const PIXELS_RESOLUTIONS = PIXELS_WIDTHS
    .map((width) => ({ w: width, h: Math.floor(width / ASPECT) }));

export const MIN_VIEW_TURN_RATE = 1, MAX_VIEW_TURN_RATE = 5;

export type Settings = {
    DEBUG: boolean;
    CURRENT_PIXELS_RESOLUTION: number;
    VIEW_BOBBING: boolean;
    FOV: number;
    VIEW_TURN_RATE: number;
    CONTROLS: Record<ControlKey, string>;
};

export const SETTINGS: Settings = {
    DEBUG: false,
    CURRENT_PIXELS_RESOLUTION: 2,
    VIEW_BOBBING: true,
    FOV: 90,
    VIEW_TURN_RATE: (MIN_VIEW_TURN_RATE + MAX_VIEW_TURN_RATE) / 2,
    CONTROLS: Object.assign({}, DEFAULT_KEYS),
};

const LOCAL_STORAGE_KEY = "Settings";

export function loadSettings() {
    const settingsJson = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (settingsJson) {
        try {
            const settings: Settings = JSON.parse(settingsJson);
            Object.assign(SETTINGS, settings);
            console.log("Loaded settings:", settings);
        } catch (exception) {
            console.log("Could not load settings", exception, settingsJson);
        }
    } else {
        console.log("No settings found");
    }
}

export function saveSettings() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SETTINGS));
}
