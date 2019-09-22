import { timeoutFor } from './timeoutHelper';

class AudioBufferHelper {
    public async normalizeBufferVolume(
        buffer: Float32Array,
        normalizeOnlyIfTooLoud: boolean = false,
        nonBlocking: boolean = false,
    ): Promise<void> {

        const maxVolume = buffer.reduce((p, c) => {
            const prev = Math.abs(p);
            const cur = Math.abs(c);
            return (prev > cur ? prev : cur);
        });

        if (!normalizeOnlyIfTooLoud || maxVolume > 1) {
            // Force normalize, encoder will produce artifacts elsewise.
            for (let i = 0; i < buffer.length; i++) {
                if (nonBlocking && i % 500 === 0) {
                    await timeoutFor(0);
                }
                buffer[i] = buffer[i] / maxVolume;
            }
        }
    }
}

export const audioBufferHelper = new AudioBufferHelper();
