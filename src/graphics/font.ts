import { p } from "@src/index";
import type p5 from "p5";


let FONT: p5.Font;

export async function loadFont() {
    FONT = await p.loadFont("assets/font.otf");
}

export function getFont(): p5.Font {
    return FONT;
}

export function setupOverlayFont(og: p5.Graphics) {
    og.fill(255);
    og.stroke(0);
    og.strokeWeight(5);
    og.textSize(40);
}