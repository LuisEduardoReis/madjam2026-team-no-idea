import p5 from "p5";


export type Image = p5.Image;

export type HorizontalAlign = typeof p5.LEFT | typeof p5.CENTER | typeof p5.RIGHT | undefined;
export type VerticalAlign = typeof p5.TOP | typeof p5.BOTTOM | typeof p5.CENTER | typeof p5.BASELINE | undefined;

export class Color {
    public val: number = 0;
    public r: number = 0;
    public g: number = 0;
    public b: number = 0;
    public a: number = 0;

    constructor(val: number) {
        this.set(val);
    }

    set(val: number) {
        this.val = val;
        this.a = (val & 0xff000000) >> 24;
        this.r = (val & 0x00ff0000) >> 16;
        this.g = (val & 0x0000ff00) >> 8;
        this.b = (val & 0x000000ff);
    }
}