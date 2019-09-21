import { BufferManipulations } from '.';
import { FadeType } from './bufferManipulator';

window.AudioBuffer = jest.fn((options: AudioBufferOptions) => {
    return { length: options.length, duration: options.length / options.sampleRate } as any;
});

const mockAudioBuffer = new AudioBuffer({
    length: 44000 * 1,
    numberOfChannels: 1,
    sampleRate: 44000,
});

test('BufferManipulator cut should accept only valid arguments', () => {
    const bufferManipulator = new BufferManipulations(mockAudioBuffer);

    // Start out of buffer.
    expect(bufferManipulator.cut(-1))
        .toBe(false);
    // End out of buffer
    expect(bufferManipulator.cut(undefined, 1100))
        .toBe(false);
    // Both out of buffer
    expect(bufferManipulator.cut(-10, 1100))
        .toBe(false);
    // Start is earlier than end
    expect(bufferManipulator.cut(500, 400))
        .toBe(false);
    // Both in buffer should succeed
    expect(bufferManipulator.cut(0, 200))
        .toBe(true);
});

test('BufferManipulator fadeIn should accept only valid arguments ', async () => {
    const bufferManipulator = new BufferManipulations(mockAudioBuffer);
    expect(bufferManipulator.fadeIn(-1))
        .toBe(false);
    expect(bufferManipulator.fadeIn(undefined, 1100))
        .toBe(false);
    expect(bufferManipulator.fadeIn(-10, 1100))
        .toBe(false);
    expect(bufferManipulator.fadeIn(500, 400))
        .toBe(false);
    expect(bufferManipulator.fadeIn(0, 200))
        .toBe(true);
    expect(() => bufferManipulator.fadeIn(0, 200, FadeType.Exponential))
        .toThrow(/Not implemented/);
});

test('BufferManipulator fadeOut should accept only valid arguments ', async () => {
    const bufferManipulator = new BufferManipulations(mockAudioBuffer);
    expect(bufferManipulator.fadeOut(-1))
        .toBe(false);
    expect(bufferManipulator.fadeOut(undefined, 1100))
        .toBe(false);
    expect(bufferManipulator.fadeOut(-10, 1100))
        .toBe(false);
    expect(bufferManipulator.fadeOut(500, 400))
        .toBe(false);
    expect(bufferManipulator.fadeOut(0, 200))
        .toBe(true);
    expect(() => bufferManipulator.fadeOut(0, 200, FadeType.Exponential))
        .toThrow(/Not implemented/);
});
