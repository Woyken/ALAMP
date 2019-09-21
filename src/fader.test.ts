import { Fader } from './fader';

test('Fader apply linear face ascending and descending', async () => {
    const testArray = new Float32Array(500);
    for (let i = 0; i < testArray.length; i++) {
        // Create random "music", without silence.
        testArray[i] = Math.max(0.1, Math.random());
    }
    const originalArray = new Float32Array(testArray);

    const faderAsc = new Fader(0, 100);
    await faderAsc.applyLinearFade(testArray);

    const faderDesc = new Fader(400, 500, false);
    await faderDesc.applyLinearFade(testArray);

    for (let i = 0; i < 100; i++) {
        const currentScale = testArray[i] / originalArray[i];
        const nextScale = testArray[i + 1] / originalArray[i + 1];
        expect(currentScale)
            .toBeLessThan(nextScale);
    }

    for (let i = 100; i < 400; i++) {
        expect(testArray[i])
            .toEqual(originalArray[i]);
    }

    for (let i = 400; i < testArray.length - 1; i++) {
        const currentScale = testArray[i] / originalArray[i];
        const nextScale = testArray[i + 1] / originalArray[i + 1];
        expect(currentScale)
            .toBeGreaterThan(nextScale);
    }
});
