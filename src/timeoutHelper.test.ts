import { timeoutFor } from './timeoutHelper';

test('timeoutFor should resolve after specified time', async () => {
    let resolved = false;
    const timeoutPromise = timeoutFor(500)
        .then(() => {
            resolved = true;
        });

    expect(resolved)
        .toEqual(false);

    setTimeout(() => {
        resolved = false;
    },         400);

    expect(resolved)
        .toEqual(false);

    await timeoutPromise;

    expect(resolved)
        .toEqual(true);
});
