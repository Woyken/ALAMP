import { IEffect } from './iEffect';

export type EffectId = number;

export class EffectStore {
    private effectList: IEffect[] = [];

    public add(effect: IEffect): EffectId {
        const id = this.findFirstFreeIndex();
        this.effectList[id] = effect;
        return id;
    }

    public removeById(id: EffectId): void {
        this.effectList.splice(id, 1);
    }

    private findFirstFreeIndex(): EffectId {
        let i = 0;
        while (this.effectList[i] !== undefined) {
            i++;
        }
        return i;
    }
}
