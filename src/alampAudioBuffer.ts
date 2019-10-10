import { IEffect } from './effects/iEffect';
import { EffectStore } from './effects/effectStore';

export interface IAddFadeEffectOptions {
    fromMs: number;
    toMs: number;
    /**
     * Percentage 0-100. At what level of volume shoud fade effect start.
     */
    fromLevel: number;
    /**
     * Percentage 0-100. At what level of volume should fade effect end.
     */
    toLevel: number;
}

export interface IAlampAudioBufferOptions {
    buffer: AudioBuffer;
    /**
     * When possible, this variable will specify
     * how often script should give back control when iterating through arrays.
     */
    sleepEveryIteration?: number;
}

export class AlampAudioBuffer {
    private effectStore: EffectStore = new EffectStore();
    // Still debating if should expose originalBuffer. What it's type should be,
    // right now due to implementation it is AudioBuffer,
    // this might change if I want to support more browsers.

    public constructor(
        private options: IAlampAudioBufferOptions,
    ) {
    }

    public addFadeEffect(
        options: IAddFadeEffectOptions,
    ): number {
        if (options.fromLevel < 0 || options.fromLevel > 100) {
            throw Error('Invalid Fade effect start from volume level.');
        }
        if (options.toLevel < 0 || options.toLevel > 100) {
            throw Error('Invalid Fade effect end at volume level.');
        }
        const startVolume = options.fromLevel / 100;
        const endVolume = options.toLevel / 100;
        const volumeDiff = endVolume - startVolume;

        const effect: IEffect = {
            callback: (data): number => {
                // This value should be between start and end values.
                const currentMultiplier = volumeDiff * data.progress;
                return data.value * currentMultiplier;
            },
            fromMs: options.fromMs,
            toMs: options.toMs,
        };
    }

    public addCustomEffect(
        options: IEffect,
    ): number {
        return this.effectStore.add(options);
    }
}
