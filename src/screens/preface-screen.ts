import {AbstractScreen} from "@src/screens/abstract-screen";
import type {Texture} from "@src/graphics/texture";
import {getTexture} from "@src/graphics/textures";
import {getGraphics} from "@src/graphics/graphics";
import {GAME} from "@src/index";
import { map } from "@src/util";
import {KEY_PRESSED} from "@src/input/input";
import {SETTINGS} from "@src/settings";
import {ControlKey, getKeyName} from "@src/input/controls";
import {WorldScreen} from "@src/screens/world-screen";
import {setupOverlayFont} from "@src/graphics/font";


export class PrefaceScreen extends AbstractScreen {

    public static readonly ID = 'PREFACE_SCREEN';

    public crownTexture: Texture;
    public bunnyWithCrownTexture: Texture;
    public bunnyWithoutCrownTexture: Texture;

    public timer: number = 0;

    constructor() {
        super(PrefaceScreen.ID);

        this.crownTexture = getTexture("sprites/crown/crown_000");
        this.bunnyWithoutCrownTexture = getTexture("sprites/bunny/Bunny_005");
        this.bunnyWithCrownTexture = getTexture("sprites/bunny/Bunny_004");
    }

    update(delta: number) {
        this.timer += delta;

        if (KEY_PRESSED.get(SETTINGS.CONTROLS[ControlKey.FIRE])) {
            GAME.changeScreen(WorldScreen.ID);
        }
    }

    draw() {
        const og = getGraphics().OVERLAY;
        og.background(0);

        // Crown
        const cw = og.width / 8;
        const ch = og.width / 8;
        const cx = og.width * 0.6 - cw / 2;
        const cy = og.height * 0.5 - ch*0.5 * Math.abs(Math.sin(2*Math.PI*GAME.time * 0.5)) - ch / 2;
        const ca = map(this.timer, 3,4, 1,0, true);
        og.tint(255, 255 * ca);
        og.image(this.crownTexture.raw, cx, cy, cw, ch);
        og.noTint();

        // Bunny
        const bw = og.width / 4;
        const bh = og.width / 4;
        const bx = og.width * 0.4 - bw / 2;
        const by = og.height * 0.5 - bh / 2;
        const ba = map(this.timer, 4.5,5.5, 1,0, true);
        og.tint(255, 255 * ba);
        og.image(this.bunnyWithoutCrownTexture.raw, bx, by, bw, bh);
        og.tint(255, 255 * (1 - ba));
        og.image(this.bunnyWithCrownTexture.raw, bx, by, bw, bh);
        og.noTint();

        // Top message
        setupOverlayFont(og, 60);
        og.textAlign("center");
        og.text(`That damn rabbit got the crown!`, og.width/2, og.height*0.2);

        // Bottom message
        if (this.timer > 5.5) {
            setupOverlayFont(og, 60);
            og.textAlign("center");
            og.text(`Go get him!`, og.width/2, og.height*0.8);
            if (GAME.time % 1 < 0.5) {
                const key = getKeyName(SETTINGS.CONTROLS[ControlKey.FIRE]);
                og.text(`Press ${key} to start!`, og.width/2, og.height*0.9);
            }
        }
    }
}