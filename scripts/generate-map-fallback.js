// Generates the file:// fallback for a country map from its canonical SVG.
//
// Browsers block fetch() on the file:// protocol, so when index.html is opened
// by double-clicking (no server), the map cannot be fetched. This script wraps
// the canonical SVG in a tiny JS file that assigns it to a global, which a
// <script> tag CAN load over file://. The SVG stays the single source of truth;
// the generated JS is a build artifact — re-run this whenever the SVG changes.
//
// Usage:
//   node scripts/generate-map-fallback.js <svgPath> <outPath> <globalName>
// Example:
//   node scripts/generate-map-fallback.js assets/states.svg countries/brazil/map.js BRAZIL_MAP_SVG

const fs = require("fs");

const [svgPath, outPath, globalName] = process.argv.slice(2);

if (!svgPath || !outPath || !globalName) {
    console.error("Usage: node scripts/generate-map-fallback.js <svgPath> <outPath> <globalName>");
    process.exit(1);
}

const svg = fs.readFileSync(svgPath, "utf8");
const output = `window.${globalName} = ${JSON.stringify(svg)};\n`;
fs.writeFileSync(outPath, output);

console.log(`Wrote ${outPath} (${output.length} bytes) from ${svgPath}.`);
