# GeoStates

Guess the State! A small browser game: you're shown a country's map, a state lights up, and you type its name (or abbreviation) to fill it in — clear the whole map with as few mistakes as you can.

**Play it here:** [https://igor-couto.github.io/guess-the-state/](https://igor-couto.github.io/guess-the-state/)

![GeoStates preview](https://github.com/igor-couto/images/blob/main/guess-the-state/preview.png?raw=true)

## How to play

- A random state is highlighted on the map. You can also click any state to select it.
- Type its name in the box and press **Guess** (or hit Enter).
- Accents and abbreviations are accepted — `São Paulo`, `Sao Paulo`, and `SP` all count.
- Correct guesses fill the state in. The counters track how many you've completed and how many mistakes you've made. Fill every state to win.

## Running locally

There's no build step and no dependencies — it's plain HTML, CSS, and JavaScript.

The quickest way is to just open `index.html` in your browser (double-click it). Each country map ships with an inline fallback, so the game also works straight from the filesystem (`file://`).

To run it the way it's served in production (over HTTP), start any static file server from the project root, for example:

```
py -m http.server 8000        # Windows
python3 -m http.server 8000   # macOS / Linux
```

Then open http://localhost:8000.

## Project layout

```
index.html / styles.css / script.js   Landing page (the country carousel)
assets/                                Shared images, sounds, fonts, maps, theme.css
countries/game.js                      Reusable game engine (window.createCountryGame)
countries/brazil/                      A country instance: index.html, style.css,
                                       script.js (config + answers), map.js (offline fallback)
scripts/generate-map-fallback.js       Builds a map.js fallback from a map SVG
```

The game logic lives once in `countries/game.js`. Each country is a thin instance that hands the engine its regions, its map, and the selectors for the page elements.

## Adding a country

1. **Create the folder** `countries/<country>/` with its own `index.html`, `style.css`, and `script.js`. Copying Brazil's files is the easiest starting point.
2. **Add the map** as an SVG (for example in `assets/`). Every clickable region's `<path>` needs an `id` that matches the `id` you give it in the config below.
3. **Generate the `file://` fallback** so the map also loads without a server:

   ```
   node scripts/generate-map-fallback.js assets/<country>.svg countries/<country>/map.js <COUNTRY>_MAP_SVG
   ```

4. **Configure the game** in the country's `script.js`:

   ```js
   window.createCountryGame({
     regions: [
       { id: "São Paulo", name: "São Paulo", answers: ["São Paulo", "Sao Paulo", "SP"] },
       // ...one entry per region
     ],
     completionMessage: "Congratulations! You've completed <country>.",
     map: {
       containerSelector: "#map",
       src: "../../assets/<country>.svg",   // fetched over HTTP
       fallbackScriptSrc: "./map.js",       // loaded only on file:// or if the fetch fails
       fallbackGlobal: "<COUNTRY>_MAP_SVG",
       svgId: "map-svg",
       ariaLabel: "<country>'s map",
       regionsSelector: "#Regions > path",  // the guessable paths inside the SVG
       errorMessage: "The map could not be loaded."
     },
     elements: {
       inputSelector: "#answerInput",
       buttonSelector: "#btn",
       completedSelector: "#completed",
       totalSelector: "#total",
       mistakesSelector: "#mistakes"
     },
     sounds: {
       select: "../../assets/sound/select.wav",
       correct: "../../assets/sound/correct.wav",
       error: "../../assets/sound/error.wav"
     }
   });
   ```

5. **Link it** from the landing page by adding a card for the new country to the carousel in the root `index.html`.

## Author

**Igor Couto** — [igor.fcouto@gmail.com](mailto:igor.fcouto@gmail.com)
