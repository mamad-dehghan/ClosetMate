/**
 * Generates the flat-lay garment illustrations used by the demo wardrobe.
 * Run with: bun scripts/generate-samples.ts
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

type Shape = { path: string; details?: string };

const SHAPES: Record<string, Shape> = {
  tee: {
    path: "M150 118 L108 150 L132 196 L152 184 L152 382 H248 V184 L268 196 L292 150 L250 118 L224 108 Q200 132 176 108 Z",
    details: 'M176 108 Q200 138 224 108',
  },
  shirt: {
    path: "M152 116 L110 148 L132 194 L152 182 L152 386 H248 V182 L268 194 L290 148 L248 116 L224 106 L200 132 L176 106 Z",
    details:
      'M200 132 V382 M176 106 L200 132 L224 106 M186 210 h28 v34 h-28 z',
  },
  sweater: {
    path: "M142 120 L100 156 L124 210 L148 198 L148 372 Q200 384 252 372 V198 L276 210 L300 156 L258 120 L222 110 Q200 128 178 110 Z",
    details:
      'M178 110 Q200 132 222 110 M148 352 Q200 366 252 352 M148 372 Q200 384 252 372',
  },
  coat: {
    path: "M146 116 L96 164 L122 222 L148 208 V430 H252 V208 L278 222 L304 164 L254 116 L220 104 L200 142 L180 104 Z",
    details:
      "M200 142 V428 M200 210 H228 V246 H200 M148 208 L200 142 L252 208",
  },
  blazer: {
    path: "M150 116 L104 160 L128 214 L150 202 V392 H250 V202 L272 214 L296 160 L250 116 L222 106 L200 150 L178 106 Z",
    details: "M200 150 L178 250 L200 330 L222 250 Z M200 330 V390",
  },
  jeans: {
    path: "M146 118 H254 L266 388 H214 L204 246 L196 388 H134 Z",
    details: "M146 150 H254 M200 150 V240 M158 132 h84 v18 h-84 z",
  },
  chinos: {
    path: "M144 118 H256 L272 392 H212 L202 248 L194 392 H130 Z",
    details: "M144 152 H256 M200 152 V244 M168 128 h64 v16 h-64 z",
  },
  trousers: {
    path: "M148 118 H252 L264 430 H216 L202 252 L190 430 H136 Z",
    details: "M148 150 H252 M200 150 V260 M164 132 h72 v18 h-72 z",
  },
  dress: {
    path: "M168 112 H232 L242 196 L292 430 H108 L158 196 Z",
    details: "M168 112 Q200 138 232 112 M158 196 Q200 214 242 196",
  },
  sneakers: {
    path: "M96 340 Q96 292 140 284 L196 272 Q222 268 246 286 L300 322 Q322 336 318 356 Q314 376 288 378 H120 Q96 378 96 356 Z",
    details:
      "M140 284 L176 330 M196 272 L214 320 M96 356 H316 M214 320 Q246 330 268 318",
  },
  boots: {
    path: "M148 178 H246 L250 306 L300 330 Q324 342 320 366 Q316 384 286 384 H150 Q146 300 148 178 Z",
    details: "M148 200 H246 M150 384 H318 M246 306 Q270 318 296 326",
  },
  tote: {
    path: "M116 190 H284 L300 396 Q300 410 286 410 H114 Q100 410 100 396 Z",
    details:
      "M158 190 V150 Q158 108 200 108 Q242 108 242 150 V190 M116 230 H284",
  },
};

const ITEMS: { file: string; shape: string; color: string; bg: string }[] = [
  { file: "tee", shape: "tee", color: "#F4EFE6", bg: "#EFE7DA" },
  { file: "shirt", shape: "shirt", color: "#A8C3D9", bg: "#EDE9E1" },
  { file: "sweater", shape: "sweater", color: "#3A3733", bg: "#EDE6DA" },
  { file: "coat", shape: "coat", color: "#B08968", bg: "#F0E9DE" },
  { file: "blazer", shape: "blazer", color: "#2B3A55", bg: "#EAE6DE" },
  { file: "jeans", shape: "jeans", color: "#4A6C8C", bg: "#EFE9DF" },
  { file: "chinos", shape: "chinos", color: "#D8C3A5", bg: "#F1EAE0" },
  { file: "trousers", shape: "trousers", color: "#1C1A17", bg: "#EDE6DA" },
  { file: "dress", shape: "dress", color: "#33493A", bg: "#EFEADE" },
  { file: "sneakers", shape: "sneakers", color: "#F4EFE6", bg: "#EAE7E0" },
  { file: "boots", shape: "boots", color: "#7A5230", bg: "#EFE7DB" },
  { file: "tote", shape: "tote", color: "#EADFCB", bg: "#EDE9E1" },
];

function render({ shape, color, bg }: { shape: string; color: string; bg: string }) {
  const definition = SHAPES[shape];
  if (!definition) throw new Error(`Unknown shape: ${shape}`);
  const stroke = shape === "sneakers" || shape === "tee" ? "#CFC4B4" : color;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500" role="img">
  <rect width="400" height="500" rx="28" fill="${bg}"/>
  <ellipse cx="200" cy="428" rx="118" ry="16" fill="#000" opacity="0.05"/>
  <path d="${definition.path}" fill="${color}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
  ${definition.details ? `<path d="${definition.details}" fill="none" stroke="#1C1A17" stroke-opacity="0.28" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>` : ""}
</svg>
`;
}

const outDir = path.resolve(import.meta.dir, "..", "public", "sample");
await mkdir(outDir, { recursive: true });

for (const item of ITEMS) {
  await writeFile(path.join(outDir, `${item.file}.svg`), render(item), "utf8");
}

console.log(`Wrote ${ITEMS.length} sample illustrations to ${outDir}`);
