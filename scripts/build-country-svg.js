// Builds a labeled, game-ready SVG from a Natural Earth admin-1 GeoJSON.
// Each first-order region (province/state) becomes one <path id="<name>"> inside
// a group, so the game engine can select and fill it — same structure the Brazil
// map uses. Colours mirror the shared palette; completing a region makes its
// translucent fill opaque (see getOpaqueFill in countries/game.js).
//
// Usage:
//   node scripts/build-country-svg.js <geojson> <adm0_a3> <outSvg> <groupId>
// Example:
//   node scripts/build-country-svg.js /tmp/ne_admin1.geojson ARG assets/argentina.svg Provinces

const fs = require("fs");

const [inPath, adm0, outPath, groupId, regionsPath] = process.argv.slice(2);
if (!inPath || !adm0 || !outPath || !groupId) {
    console.error("Usage: node scripts/build-country-svg.js <geojson> <adm0_a3> <outSvg> <groupId> [regions.json]");
    process.exit(1);
}

// Shared palette (matches assets/states.svg); translucent so completion can opaque it.
const PALETTE = [
    "rgba(120, 155, 2, 0.5)",
    "rgba(238, 206, 89, 0.5)",
    "rgba(230, 82, 57, 0.5)",
    "rgba(52, 83, 138, 0.5)",
    "rgba(225, 139, 153, 0.5)"
];

const WIDTH = 1000;
const PAD = 12;

const data = JSON.parse(fs.readFileSync(inPath, "utf8"));
const features = data.features
    .filter(f => f.properties.adm0_a3 === adm0)
    .sort((a, b) => String(a.properties.name).localeCompare(String(b.properties.name)));

if (features.length === 0) {
    console.error(`No features found for adm0_a3="${adm0}".`);
    process.exit(1);
}

function eachRing(geom, cb) {
    if (geom.type === "Polygon") geom.coordinates.forEach(cb);
    else if (geom.type === "MultiPolygon") geom.coordinates.forEach(poly => poly.forEach(cb));
}

// Mean latitude for an equirectangular x-correction (keeps the aspect ratio sane).
let minLat = Infinity, maxLat = -Infinity;
features.forEach(f => eachRing(f.geometry, ring => ring.forEach(([, la]) => {
    if (la < minLat) minLat = la;
    if (la > maxLat) maxLat = la;
})));
const kx = Math.cos(((minLat + maxLat) / 2) * Math.PI / 180);

const project = (lon, la) => [lon * kx, -la];

let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
features.forEach(f => eachRing(f.geometry, ring => ring.forEach(([lon, la]) => {
    const [x, y] = project(lon, la);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
})));

const scale = (WIDTH - PAD * 2) / (maxX - minX);
const HEIGHT = Math.round((maxY - minY) * scale + PAD * 2);

function xy(lon, la) {
    const [px, py] = project(lon, la);
    return [
        Math.round((PAD + (px - minX) * scale) * 100) / 100,
        Math.round((PAD + (py - minY) * scale) * 100) / 100
    ];
}

function ringD(ring) {
    let d = "";
    for (let i = 0; i < ring.length; i++) {
        const [x, y] = xy(ring[i][0], ring[i][1]);
        d += (i === 0 ? "M" : "L") + x + "," + y + " ";
    }
    return d.trim() + "Z";
}

function geomD(geom) {
    const parts = [];
    eachRing(geom, ring => parts.push(ringD(ring)));
    return parts.join(" ");
}

function esc(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// Colour each region by its group (like Brazil's regions). The order of keys in
// the regions file maps to the palette. Without a regions file, fall back to a
// repeating palette so the tool still works for any country.
let styleEntries;
let classFor;

if (regionsPath) {
    const groups = JSON.parse(fs.readFileSync(regionsPath, "utf8"));
    const sanitize = r => "r-" + r.normalize("NFKD").replace(/[^\x00-\x7F]/g, "")
        .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const provinceClass = {};
    const entries = [];
    Object.keys(groups).forEach((region, idx) => {
        const cls = sanitize(region);
        entries.push(`        .${cls} { fill: ${PALETTE[idx % PALETTE.length]}; }`);
        groups[region].forEach(name => { provinceClass[name] = cls; });
    });
    entries.push("        .r-unassigned { fill: rgba(170, 170, 170, 0.5); }");
    styleEntries = entries.join("\n");

    const missing = features.filter(f => !provinceClass[f.properties.name]).map(f => f.properties.name);
    if (missing.length) console.warn("WARNING: no region for:", missing.join(", "));
    classFor = name => provinceClass[name] || "r-unassigned";
} else {
    styleEntries = PALETTE.map((c, i) => `        .c${i} { fill: ${c}; }`).join("\n");
    classFor = (name, i) => "c" + (i % PALETTE.length);
}

const paths = features.map((f, i) =>
    `        <path id="${esc(f.properties.name)}" class="${classFor(f.properties.name, i)} str" d="${geomD(f.geometry)}" />`
).join("\n");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" id="map-svg">
    <defs>
        <style>
        .str { stroke: #ffffff; stroke-width: 1.1; stroke-linejoin: round; }
${styleEntries}
        </style>
    </defs>
    <g id="${groupId}" fill-rule="evenodd">
${paths}
    </g>
</svg>
`;

fs.writeFileSync(outPath, svg);
console.log(`Wrote ${outPath} (${(svg.length / 1024).toFixed(0)} KB), ${features.length} regions, viewBox 0 0 ${WIDTH} ${HEIGHT}.`);
console.log("Regions:");
features.forEach(f => console.log("  - " + f.properties.name));
