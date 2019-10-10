export interface IEffectCallbackData {
    /**
     * Should be from -1 to 1 float.
     * Some times this value is above 1 due to different encoders.
     */
    value: number;
    /**
     * Progress from 0 to 1 for current effect iteration.
     */
    progress: number;
}

export interface IEffect {
    fromMs: number;
    toMs: number;
    callback: (data: IEffectCallbackData) => number;
}
