import type { Game } from "@src/game";
import type { Settings } from "@src/settings";

declare global {
    const __APP_CONFIG__: Record<string, string>;

    interface Window {
        GAME: Game;
        SETTINGS: Settings;
    }
}

export {};