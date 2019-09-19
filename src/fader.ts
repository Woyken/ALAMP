import { timeoutFor } from './timeoutHelper';

export class Fader {
    constructor(
        private startFrame: number,
        private endFrame: number,
        private ascending: boolean = true,
    ) {
    }

    public async applyLinearFade(
        buffer: Float32Array,
        nonBlocking: boolean = false,
    ): Promise<void> {
        const fadeFrameCount = this.endFrame - this.startFrame;
        for (let i = this.startFrame; i < this.startFrame + fadeFrameCount; i++) {
            if (nonBlocking && i % 500) {
                // Every once in a while yeld
                await timeoutFor(0);
            }
            const currentFrameFadePercentage = (i - this.startFrame) / fadeFrameCount;
            buffer[i] = this.ascending ?
                buffer[i] * currentFrameFadePercentage :
                buffer[i] * (1 - currentFrameFadePercentage);
        }
    }
}
