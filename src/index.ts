import p5 from "p5";
import {
    buildGraphics,
    getCanvasSize,
    getGraphics
} from "@src/graphics/graphics";
import { FPS, loadSettings, SETTINGS } from "@src/settings";
import { Game } from "@src/game";
import {
    handleKeyPressed,
    handleKeyReleased, handleMouseDragged,
    handleMouseMoved,
    handleMousePressed, handleMouseReleased,
    resetInput
} from "@src/input/input";
import { loadTiledFiles } from "@src/tiled/tiled";
import { initTextures, loadTextures } from "@src/graphics/textures";
import { initTiles } from "@src/world/tiles/tiles";
import { initSprites } from "@src/graphics/sprites";
import { loadFont } from "@src/graphics/font";
import { loadAudio, updateSounds } from "@src/audio/audio";
import { PerformanceMonitor } from "@src/performance";

p5.disableFriendlyErrors = true;

if (__APP_CONFIG__.MODE === "DEVELOPMENT") {
    console.log("Enabling live reload");
    new EventSource('/esbuild').addEventListener('change', () => location.reload());
}

export let GAME: Game;
export let CANVAS: p5.Renderer;

const performance: PerformanceMonitor = new PerformanceMonitor();

const sketchBuilder = (s: p5) => {
    s.setup = async () => {
        loadSettings();
        loadAudio();

        await Promise.all([
            loadTiledFiles(),
            loadTextures(),
            loadFont(),
        ]);

        initTextures();
        initSprites();
        initTiles();

        const canvasSize = getCanvasSize();
        CANVAS = s.createCanvas(canvasSize.w, canvasSize.h);
        CANVAS.style("display", "block");

        s.frameRate(FPS);

        buildGraphics();

        GAME = new Game();

        window.GAME = GAME;
        window.SETTINGS = SETTINGS;
    };

    s.draw = () => {
        performance.beginFrame();

        const numUpdates = performance.popUpdateCount();
        for (let i = 0; i < numUpdates; i++) GAME.update(1 / FPS);

        resetInput();

        const g = getGraphics();
        g.OVERLAY.clear();

        GAME.draw();

        g.PIXELS.updatePixels();
        g.MAIN.image(g.PIXELS, g.PIXELS_CAMERA_OFFSET.x,g.PIXELS_CAMERA_OFFSET.y, g.MAIN.width, g.MAIN.height);
        g.MAIN.image(g.OVERLAY, g.PIXELS_CAMERA_OFFSET.x,g.PIXELS_CAMERA_OFFSET.y, g.MAIN.width, g.MAIN.height);

        s.image(g.MAIN, 0,0, s.width, s.height);

        performance.endFrame();

        if (SETTINGS.DEBUG) {
            performance.draw();
        }
    };

    s.windowResized = () => {
        const canvasSize = getCanvasSize();
        s.resizeCanvas(canvasSize.w, canvasSize.h);
    };

    s.keyPressed = handleKeyPressed;
    s.keyReleased = handleKeyReleased;
    s.mousePressed = handleMousePressed;
    s.mouseMoved = handleMouseMoved;
    s.mouseDragged = handleMouseDragged;
    s.mouseReleased = handleMouseReleased;
};

export const p: p5 = new p5(sketchBuilder);