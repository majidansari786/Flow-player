# FlowPlayer

A drop-in streaming video player: HLS (`.m3u8`), MP4 and WebM. One file, no build step. hls.js loads automatically only when a stream needs it.

## Quick start

```html
<script src="https://cdn.jsdelivr.net/npm/flow-stream-player/flowplayer.js"></script>
<div data-flow-src="https://example.com/stream.m3u8"></div>
```

Or with JavaScript:

```js
const p = new FlowPlayer('#player', { accent: '#dc2626', autoplay: true });
p.load('https://example.com/video.mp4');
p.on('ended', () => console.log('finished'));
```

## Options

| Option | Default | Description |
|---|---|---|
| `src` | `''` | Video or stream URL |
| `poster` | `''` | Poster image |
| `autoplay` / `muted` / `loop` | `false` | Standard behaviour |
| `controls` | `true` | Set `false` to hide the UI |
| `preview` | `true` | Hover preview on the seek bar (set `false` to save bandwidth) |
| `previewStep` | `10` | Seconds between preview frames (higher = less server load) |
| `thumbs` | `null` | Sprite sheet for instant previews: `{url, width, height, cols, interval}` |
| `exclusive` | `true` | Pause other players when this one plays |
| `accent`, `accent2` | red | Gradient colours |
| `speeds` | `[0.5…2]` | Speed choices |
| `hlsSrc` | jsDelivr | Where to load hls.js from |

HTML attributes: `data-flow-src`, `data-flow-poster`, `data-flow-autoplay`, `data-flow-muted`, `data-flow-loop`, `data-flow-accent`, `data-flow-accent2`.

CSS: `--fp-accent`, `--fp-accent2`, `--fp-radius` can be set on the container.

## API

Methods: `load(url, {autoplay})`, `loadFile(file)`, `play()`, `pause()`, `toggle()`, `seek(t)`, `skip(±s)`, `volume(0-1)`, `mute()`, `speed(x)`, `quality(i)`, `fullscreen()`, `pip()`, `destroy()`.

Getters: `currentTime`, `duration`, `paused`.

Events (`player.on(name, fn)`, also DOM events named `flowplayer:<name>`): `ready`, `play`, `pause`, `ended`, `timeupdate`, `volumechange`, `ratechange`, `levels`, `qualitychange`, `error`.

Keyboard: Space/K play, ←/→ 5s, J/L skip step, ↑/↓ volume, M mute, F fullscreen, I picture-in-picture, `<` `>` speed, 0–9 jump.

## Notes

- Your video server must allow cross-origin requests (CORS) for HLS to load in the browser.
- Set `window.FLOWPLAYER_NO_AUTO = true` before the script to disable auto-init of `data-flow-src` elements.

MIT License
