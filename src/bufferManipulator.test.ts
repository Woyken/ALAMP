import { BufferManipulations } from '.';

window.AudioBuffer = jest.fn((options: AudioBufferOptions) => {
    return { length: options.length, duration: options.length / options.sampleRate } as any;
});

test('BufferManipulator should save cut position', () => {
    const audioBuffer = new AudioBuffer({
        length: 44000 * 1,
        numberOfChannels: 1,
        sampleRate: 44000,
    });
    const bufferManipulator = new BufferManipulations(audioBuffer);

    // Start out of buffer.
    expect(bufferManipulator.cut(-1, 200))
        .toBe(false);
    // End out of buffer
    expect(bufferManipulator.cut(0, 1100))
        .toBe(false);
    // Both out of buffer
    expect(bufferManipulator.cut(-10, 1100))
        .toBe(false);
    // Both in buffer should succeed
    expect(bufferManipulator.cut(0, 200))
        .toBe(true);
});
