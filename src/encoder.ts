import * as lamejs from 'lamejs';
import { timeoutFor } from './timeoutHelper';

export class Encoder {
    /**
     * Takes processed audio buffer, encodes in MP3 format, returns raw MP3 data.
     * @param audioBuffer processed audio buffer.
     * @param bitRate mp3 bitrate in **kbps**.
     * @param nonBlocking Enable non blocking workflow. Will work in batches, yelding in between.
     */
    public async encodeToMP3Buffer(
        audioBuffer: AudioBuffer,
        bitRate: number,
        nonBlocking: boolean = false,
    ): Promise<BlobPart[]> {
        const mp3encoder = new lamejs.Mp3Encoder(audioBuffer.numberOfChannels,
                                                 audioBuffer.sampleRate,
                                                 bitRate);
        //

        // tslint:disable-next-line:prefer-array-literal
        const channelsData: Int16Array[] = new Array<Int16Array>(audioBuffer.numberOfChannels);
        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            if (i > 1) {
                // lamejs doesn't support more channels.
                break;
            }
            channelsData[i] = this.convertChannelBufferForLameJS(audioBuffer.getChannelData(i));
        }

        // Comment from lamejs repository:
        // can be anything but make it a multiple of 576 to make encoders life easier
        const sampleBlockSize = 576;

        const mp3CompleteData: number[] = [];
        for (let i = 0; i < audioBuffer.length; i += sampleBlockSize) {
            if (nonBlocking) {
                await timeoutFor(0);
            }

            const leftChunk = channelsData[0].subarray(i, i + sampleBlockSize);
            let rightChunk: Int16Array | undefined;
            if (channelsData[1] !== undefined) {
                rightChunk = channelsData[1].subarray(i, i + sampleBlockSize);
            }

            const mp3PartialBuffer = mp3encoder.encodeBuffer(leftChunk, rightChunk);
            if (mp3PartialBuffer.length > 0) {
                mp3CompleteData.push(mp3PartialBuffer);
            }
        }

        const mp3buf = mp3encoder.flush(); // finish writing mp3

        if (mp3buf.length > 0) {
            mp3CompleteData.push(mp3buf);
        }

        // TODO figure out exact type that lamejs is returning
        return mp3CompleteData as any[];
    }

    /**
     * Takes processed audio buffer, encodes in MP3 format, returns Blob.
     * @param audioBuffer processed audio buffer.
     * @param bitRate mp3 bitrate in **kbps**.
     * @param nonBlocking Enable non blocking workflow. Will work in batches, yelding in between.
     */
    public async encodeToMP3Blob(
        audioBuffer: AudioBuffer,
        bitRate: number,
        nonBlocking: boolean = false,
    ): Promise<Blob> {
        const data = await this.encodeToMP3Buffer(audioBuffer, bitRate, nonBlocking);
        return new Blob(data, { type: 'audio/mp3' });
    }

    private convertChannelBufferForLameJS(channelBuffer: Float32Array): Int16Array {
        const dataAsInt16Array = new Int16Array(channelBuffer.length);

        for (let i = 0; i < channelBuffer.length; i++) {
            const n = channelBuffer[i];
            const v = n < 0 ? n * 32768 : n * 32767; // convert in range [-32768, 32767]
            const newValue = Math.max(-32768, Math.min(32768, v)); // clamp
            dataAsInt16Array[i] = newValue;
        }

        return dataAsInt16Array;
    }
}
