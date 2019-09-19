# Another lite audio manipulation project (ALAMP)

## Disclaimer

Only works in browser.

This package is in its early childhood.

It can do some things, not much as of right now.

Things might change as it progresses. Be warned.

## Why (short version)

I couldn't find any projects that allow you to easily add fade-in and fade-out effects and cut the audio. Also, Typescript support, yay!

## Usage

Install with NPM

```batch
npm install
```

(of course everything is made with promises)

```typescript
import { Decoder, BufferManipulations, Encoder } from 'alamp';

const decoder = new Decoder();

const buf = await decoder.decodeFile(file);

const manipulator = new BufferManipulations(buf);
// Crop a piece of audio. From 1st second to 5th second.
manipulator.cut(1000, 5000);
// Add a fade in from beggining to 1st second.
manipulator.fadeIn(0, 1000);
// Fade out to start 1 second before end.
manipulator.fadeOut(1000);
// Apply cuts and fades and get modified buffer.
const processedBuf = await manipulator.apply();

const encoder = new Encoder();
// Encode modified buffer to MP3 data.
const blob = await encoder.encodeToMP3Blob(processedBuffer, 196);

// Your file blob is ready here.
download(URL.createObjectURL(blob));
```

## What does it do

- Cut audio.
- Add fadeIn effect.
- Add fadeOut effect.
- Encode as MP3.

## How

Currently uses your browsers audio context to decode audio. (Only Chrome currently supports decoding mp3 files)

Some simple manipulations to the decoded buffer.

Encoding to MP3 is done with lamejs.

## Why (long version)

Long story:

My buddy was working on his side project and was searching for options to cut audio.

I ended up helping him to set up ffmpegjs, only to cut the audio clip. That's huge overkill in my opinion.

When we tried adding a fade in/out to the audio with ffmpegjs, it ended up screaming at us that it cannot copy codecs and modify stream at the same time. Okay, codecs you say... For mp3 encoding you need 3rd party libs, umm... We are using emscripten version of this THING, there's no way to add such additional libs to it.

Arrgh, screw it! I'll see if how hard is it to manipulate audio myself. Good thing we needed simple manipulations. I decided to publish this as standalone package, maybe there is someone like me, searching for this exact thing and only gets frustrated when there are a bunch half-working projects, one doesn't compile, another crashes your webpack due to gigantic size and others are just not that easy to set-up...
