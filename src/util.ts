

export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;

export enum Orientation {
    VERTICAL,
    HORIZONTAL,
}

export type Point = {
    x: number;
    y: number;
}
export function point(x: number, y: number): Point { return { x, y }; }

export type Rect = {
    x: number;
    y: number;
    w: number;
    h: number;
}
export function rect(x: number, y: number, w: number, h: number): Rect { return { x, y, w, h }; }

export function nodeId(node: Point) { return `${node.x},${node.y}`; }

export const UP = point(0,-1);
export const DOWN = point(0,1);
export const LEFT = point(-1,0);
export const RIGHT = point(1,0);

export const FOUR_NEIGHBOURS = [ UP, DOWN, LEFT, RIGHT ];
export const VERTICAL_NEIGHBOURS = [ UP, DOWN ];
export const HORIZONTAL_NEIGHBOURS = [ LEFT, RIGHT ];
export const EIGHT_NEIGHBOURS = [
    UP, DOWN, LEFT, RIGHT,
    point(1,1), point(-1,1), point(1,-1), point(-1,-1)
];


export function shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

export function pointDistance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx*dx + dy*dy);
}
export function pointDistanceSquare(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx*dx + dy*dy;
}

export function clamp(x: number, a: number, b: number): number {
    return Math.max(a,Math.min(x,b));
}

export function between(v: number, a: number, b: number): boolean {
    return v >= a && v <= b;
}

export function betweenRect(x: number, y: number, rx: number, ry: number, rw: number, rh: number) {
    return between(x,rx, rx + rw) && between(y,ry, ry + rh);
}



export function randomRange(a: number, b: number, r?: number): number {
    const x = r ?? Math.random();
    return a + x * (b - a);
}
export function randomRangeInt(a: number, b: number, r?: number): number {
    const x = r ?? Math.random();
    return Math.round(a + x * (b - a));
}

export function interpolate(a: number, b: number, x: number): number {
    return b * x + a * (1 - x);
}

export function interpolateColor(a: number, b: number, x: number) {
    const cr = interpolate((a & 0xff0000) >> 16, (b & 0xff0000) >> 16, x);
    const cg = interpolate((a & 0xff00) >> 8, (b & 0xff00) >> 8, x);
    const cb = interpolate((a & 0xff), (b & 0xff), x);
    return (cr << 16) + (cg << 8) + cb;
}

export function map(v: number, a1: number, b1: number, a2: number, b2: number): number {
    const x = (v - a1) / (b1 - a1);
    return interpolate(a2,b2, x);
}

export function rotateVector(x: number, y: number, a: number) {
    const x2 = Math.cos(a) * x - Math.sin(a) * y;
    const y2 = Math.sin(a) * x + Math.cos(a) * y;
    return point(x2,y2);
}

export function lineSegmentsIntersect(
    x0: number, y0: number, x1: number,y1: number,
    x2: number, y2: number, x3: number, y3: number
) {
    const p0 = (y3 - y2) * (x3 - x0) - (x3 - x2) * (y3 - y0);
    const p1 = (y3 - y2) * (x3 - x1) - (x3 - x2) * (y3 - y1);
    const p2 = (y1 - y0) * (x1 - x2) - (x1 - x0) * (y1 - y2);
    const p3 = (y1 - y0) * (x1 - x3) - (x1 - x0) * (y1 - y3);
    return p0 * p1 <= 0 && p2 * p3 <= 0;
}

export function lineIntersection(
    x0: number, y0: number, x1: number,y1: number,
    x2: number, y2: number, x3: number, y3: number
): Point | null {
    const A1 = y1 - y0, B1 = x1 - x0, C1 = A1*x1 + B1*y1;
    const A2 = y3 - y2, B2 = x3 - x2, C2 = A2*x2 + B2*y2;
    const delta = A1 * B2 - A2 * B1;

    if (delta === 0) return null;

    const x = (B2 * C1 - B1 * C2) / delta;
    const y = (A1 * C2 - A2 * C1) / delta;
    return point(x,y);
}

export function lineIntersectionToVerticalAxis(px: number, py: number, dx: number, dy: number, x: number) {
    return py + (x - px) * (dy / dx);
}
export function lineIntersectionToHorizontalAxis(px: number, py: number, dx: number, dy: number, y: number) {
    return px + (y - py) * (dx / dy);
}

export function vectorDotProduct(x0: number, y0: number, x1: number, y1: number) {
    return x0*x1 + y0*y1;
}

export function stepTo(a: number, b: number, x: number) {
    if (Math.abs(b - a) <= x) return b;
    return a + x * Math.sign(b - a);
}

export function angleDifference(a: number, b: number) {
    const diff = ( b - a + Math.PI ) % (2*Math.PI) - Math.PI;
    return diff < - Math.PI ? diff + 2*Math.PI : diff;
}

export function pointAngle(x1: number, y1: number, x2: number, y2: number) {
    return Math.atan2(-(y2 - y1), x2 - x1);
}

