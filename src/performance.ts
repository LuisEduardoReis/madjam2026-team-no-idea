import { FPS } from "@src/settings";
import { p } from "@src/index";

const ROLLING_FILTER = 50;

export class PerformanceMonitor {
    public startFrame: number;
    public lastFrame: number;
    public rollingCpuUsage: number;
    public rollingFpsCounter: number;
    public updateAccumulator: number;

    constructor() {
        this.startFrame = window.performance.now();
        this.lastFrame = window.performance.now();

        this.rollingCpuUsage = 0.5;
        this.rollingFpsCounter = FPS;

        this.updateAccumulator = 0;
    }

    beginFrame() {
        this.startFrame = window.performance.now();

        const delta = Math.min(0.25, (this.startFrame - this.lastFrame) / 1000);
        this.updateAccumulator += delta;
    }

    popUpdateCount() {
        const count = Math.floor(this.updateAccumulator / (1 / FPS));
        this.updateAccumulator -= count * (1 / FPS);
        return count;
    }

    endFrame() {
        const endFrame = window.performance.now();

        const frameRenderDuration = endFrame - this.startFrame;
        const cpuUsage = frameRenderDuration / (1000 / FPS);
        this.rollingCpuUsage += (cpuUsage - this.rollingCpuUsage) / ROLLING_FILTER;

        const elapsedTime = (this.startFrame - this.lastFrame) / 1000;
        const fps = 1 / elapsedTime;
        this.rollingFpsCounter += (fps - this.rollingFpsCounter) / ROLLING_FILTER;

        this.lastFrame = this.startFrame;
    }
    
    draw() {
        p.textSize(20);
        p.textAlign("right");
        p.fill(255);
        p.text(Math.round(100 * this.rollingCpuUsage) + "% CPU", p.width - 10,24);
        p.text(this.rollingFpsCounter.toFixed(1) + " FPS", p.width - 10,48);
    }
}