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


export class EndgameScreen extends AbstractScreen {

    public static readonly ID = 'ENDGAME_SCREEN';

    public crownTexture: Texture;

    constructor() {
        super(EndgameScreen.ID);

        this.crownTexture = getTexture("sprites/crown/crown_000");
    }

    update(delta: number) {
        super.update(delta);
    }

    draw() {
        const og = getGraphics().OVERLAY;
        og.background(0);

        // Crown
        const cw = og.width / 4;
        const ch = og.width / 4;
        const cx = og.width * 0.5 - cw / 2;
        const cy = og.height * 0.5 - ch*0.15 * Math.abs(Math.sin(2*Math.PI*GAME.time * 0.5)) - ch / 2;
        og.image(this.crownTexture.raw, cx, cy, cw, ch);

        // Messages
        setupOverlayFont(og, 60);
        og.textAlign("center");
        og.text(`You got the crown back!`, og.width/2, og.height*0.2);
        og.text(`Thank you for playing`, og.width/2, og.height*0.8);
    }
}