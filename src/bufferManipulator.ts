import { timeoutFor } from './timeoutHelper';
import { Fader } from './fader';
import { audioBufferHelper } from './audioBufferHelper';

export enum FadeType {
    /**
     * Linear fading.
     */
    Linear,
    /**
     * @todo
     * Not implemented yet.
     * Exponential fading.
     */
    Exponential,
}

export class BufferManipulations {
    /**
     * Create instance of this manipulator
     * Need to pass AudioBuffer from Decoder
     */
    public constructor(public originalBuffer: AudioBuffer) {
    }

    /**
     * Set trimming point for the buffer.
     * Will be appllied on "apply".
     * @param startMS start time in miliseconds.
     * @param endMS end time in miliseconds.
     * @returns true if provided arguments were within boundaries.
     */
    public cut(startMS?: number, endMS?: number): boolean {
        const audioDurationMS = this.originalBuffer.duration * 1000;

        const startTime = startMS === undefined ? 0 : startMS;
        const endTime = endMS === undefined ? audioDurationMS : endMS;

        if (!this.isWithinBuffer(startTime) || !this.isWithinBuffer(endTime)) {
            return false;
        }

        if (startTime > endTime) {
            return false;
        }

        this.cutStartMS = startTime;
        this.cutEndMS = endTime;

        return true;
    }

    /**
     * Set fading in location for the buffer.
     * Will be appllied on "apply".
     * @param startMS start time in miliseconds. If undefined set to start of audio.
     * @param endMS end time in miliseconds. If undefined set to end of audio.
     * @returns true if provided arguments were within boundaries.
     */
    public fadeIn(
        startMS?: number,
        endMS?: number,
        fadeType: FadeType = FadeType.Linear,
    ): boolean {
        if (fadeType === FadeType.Exponential) {
            throw new Error('FadeType Exponential Not implemented yet, sorry 😅');
        }

        if (startMS !== undefined) {
            if (!this.isWithinBuffer(startMS)) {
                return false;
            }
        }
        if (endMS !== undefined) {
            if (!this.isWithinBuffer(endMS)) {
                return false;
            }
        }

        if (startMS !== undefined && endMS !== undefined && startMS > endMS) {
            return false;
        }

        this.fadeInStartMS = startMS;
        this.fadeInEndMS = endMS;

        return true;
    }

    /**
     * Set fading in location for the buffer.
     * Will be appllied on "apply".
     * @param startMS start time in miliseconds from end of the audio.
     *      If undefined set to start of audio.
     * @param endMS end time in miliseconds from end of the audio.
     *      If undefined set to end of audio.
     * @returns true if provided arguments were within boundaries.
     */
    public fadeOut(
        startMS?: number,
        endMS?: number,
        fadeType: FadeType = FadeType.Linear,
    ): boolean {
        if (fadeType === FadeType.Exponential) {
            throw new Error('FadeType Exponential Not implemented yet, sorry 😅');
        }

        if (startMS !== undefined) {
            if (!this.isWithinBuffer(startMS)) {
                return false;
            }
        }
        if (endMS !== undefined) {
            if (!this.isWithinBuffer(endMS)) {
                return false;
            }
        }

        if (startMS !== undefined && endMS !== undefined && startMS > endMS) {
            return false;
        }

        this.fadeOutStartMS = startMS;
        this.fadeOutEndMS = endMS;

        return true;
    }

    /**
     * Normalize audio volume.
     * @param normalize should audio be normalized.
     */
    public normalizeVolume(normalize: boolean): void {
        this.normalize = normalize;
    }

    /**
     * Apply effects (fade and cut) to the buffer.
     * @param nonBlocking Enable non blocking workflow. Will work in batches, yelding in between.
     */
    public async apply(nonBlocking: boolean = false): Promise<AudioBuffer> {
        const channels = this.originalBuffer.numberOfChannels;
        const sampleRate = this.originalBuffer.sampleRate;

        const targetedStartFrame = this.cutStartMS === undefined ?
            0 :
            this.cutStartMS / 1000 * sampleRate;

        const targetedEndFrame = this.cutEndMS === undefined ?
            this.originalBuffer.length :
            this.cutEndMS / 1000 * sampleRate;

        const frameCount = targetedEndFrame - targetedStartFrame;

        let fadeInFader: Fader | undefined;
        if (this.fadeInStartMS !== undefined || this.fadeInEndMS !== undefined) {

            const startFrame = this.fadeInStartMS === undefined ?
                0 :
                this.fadeInStartMS / 1000 * sampleRate;

            const endFrame = this.fadeInEndMS === undefined ?
                frameCount :
                this.fadeInEndMS / 1000 * sampleRate;

            fadeInFader = new Fader(startFrame, endFrame);
        }

        let fadeOutFader: Fader | undefined;
        if (this.fadeOutStartMS !== undefined || this.fadeOutEndMS !== undefined) {

            // Start frame calculated from audio ending.
            const startFrame = this.fadeOutStartMS === undefined ?
                0 :
                frameCount - this.fadeOutStartMS / 1000 * sampleRate;

            // End frame calculated from audio ending.
            const endFrame = this.fadeOutEndMS === undefined ?
                frameCount :
                frameCount - this.fadeOutEndMS / 1000 * sampleRate;

            fadeOutFader = new Fader(startFrame, endFrame, false);
        }

        const audioContext = new AudioContext();
        const wipAudioBuffer = audioContext.createBuffer(channels, frameCount, sampleRate);

        const workingFloatBuffer = new Float32Array(frameCount);
        if (nonBlocking) {
            // After each significant action, yeld.
            await timeoutFor(0);
        }

        for (let channel = 0; channel < channels; channel++) {
            // Here the "cutStart" is applied, buffer is only copied from specified location.
            this.originalBuffer.copyFromChannel(workingFloatBuffer, channel, targetedStartFrame);
            if (nonBlocking) {
                // After each significant action, yeld.
                await timeoutFor(0);
            }

            if (fadeInFader) {
                await fadeInFader.applyLinearFade(workingFloatBuffer, nonBlocking);
            }

            if (fadeOutFader) {
                await fadeOutFader.applyLinearFade(workingFloatBuffer, nonBlocking);
            }

            await audioBufferHelper.normalizeBufferVolume(workingFloatBuffer, !this.normalize);

            wipAudioBuffer.copyToChannel(workingFloatBuffer, channel, 0);
            if (nonBlocking) {
                // After each significant action, yeld.
                await timeoutFor(0);
            }
        }
        return wipAudioBuffer;
    }

    private cutStartMS?: number;
    private cutEndMS?: number;
    private fadeInStartMS?: number;
    private fadeInEndMS?: number;
    private fadeOutStartMS?: number;
    private fadeOutEndMS?: number;
    private normalize: boolean = false;

    private isWithinBuffer(timeMS: number): boolean {
        const audioDurationMS = this.originalBuffer.duration * 1000;

        if (timeMS < 0 || timeMS > audioDurationMS) {
            return false;
        }

        return true;
    }
}
