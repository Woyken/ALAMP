import { IEffect } from './iEffect';

export class EffectProcessor {
    public applyEffectsToBuffer(buffer: Float32Array, effects: IEffect[]): void {
        // Need to save intervals which I should iterate through.
        // Ex. Fade from 1s to 2s. and fade from 54 to 56.
        // I don't need to iterate through whole array.

        // tslint:disable-next-line: prefer-array-literal
        let timingsArr: Array<{time: number, id: number, isStart: boolean }> = [];
        effects.forEach((effect, index) => {
            timingsArr.push({ time: effect.fromMs, id: index, isStart: true });
            timingsArr.push({ time: effect.toMs, id: index, isStart: false });
        });

        timingsArr = timingsArr.sort((a, b) => a.time - b.time);
        timingsArr = [
            {
                id: 2,
                isStart: false,
                time: 50,
            },
            {
                id: 3,
                isStart: false,
                time: 50,
            },
        ];
        // tslint:disable-next-line: prefer-array-literal
        const iterableChunks: Array<{ start: number, end: number, idsToCall: number[] }> = [];

        let lastEl: { time: number, id: number, isStart: boolean } | undefined;
        const currentIdCounter: number[] = [];
        while (timingsArr.length > 0) {
            const first = timingsArr.shift()!;
            if (lastEl && first.time === lastEl.time) {
                // already split in last run.
                // do not split here, just add or remove to array curent idx.
                if (first.isStart) {
                    // add to array id
                    currentIdCounter.push(first.id);
                } else {
                    // remove from array id
                    const index = currentIdCounter.indexOf(first.id);
                    if (index !== -1) {
                        currentIdCounter.splice(index, 1);
                    }
                }
                continue;
            } else {
                // otherwise, this a new chunk.
                if (lastEl) {
                    // there were others behind. Treat last one as start and current as end.
                    // Add to chunks list, current one marks end of the chunk.
                    const chunkStartTime = lastEl.time;
                    const chunkEndTime = first.time;
                    iterableChunks.push({
                        end: chunkEndTime,
                        idsToCall: [...currentIdCounter],
                        start: chunkStartTime,
                    });
                    // now add or remove ids for upcoming chunks.
                    if (first.isStart) {
                        // add
                        currentIdCounter.push(first.id);
                    } else {
                        // remove
                        const index = currentIdCounter.indexOf(first.id);
                        if (index !== -1) {
                            currentIdCounter.splice(index, 1);
                        }
                    }
                } else {
                    // I'm the first one in line. Just add id.
                    if (first.isStart) {
                        currentIdCounter.push(first.id);
                    } else {
                        // List should be empty right now, but just in case.
                        const index = currentIdCounter.indexOf(first.id);
                        if (index !== -1) {
                            currentIdCounter.splice(index, 1);
                        }
                    }
                }
            }
            lastEl = first;
        }

        // TODO
        // No we can iterate through the chunks only.
    }
}
