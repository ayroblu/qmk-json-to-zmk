import fs from "fs";
import { keymapper } from "./keymapper";
import { chunk } from "./utils";

const filePath = process.argv[2];

// cli stuff
if (!filePath || !fs.existsSync(filePath)) {
  console.error("Requires a file as an argument");
  process.exit(1);
}

// IO part
const { layers }: QmkJson = JSON.parse(fs.readFileSync(filePath).toString());

// logic part
const resultLayers = layers.map((layer) => {
  const rows = chunk(layer.map(keymapper), 6);
  const lastRow = rows[rows.length - 1].splice(3, 3);
  rows.push(lastRow);
  return chunk(rows, 2);
});

// printer part
console.log(
  resultLayers
    .map((rows, i) => {
      const maxLength = getMaxLineLength(
        rows.map((half) => half.filter((_, i) => !(i % 2)).join(" ")).flat()
      );
      const bindings = rows
        .map(
          (row) =>
            `   ${row
              .map((half) => half.join(" "))
              .map((half, i) => (!(i % 2) ? half.padStart(maxLength) : half))
              .join("  ")}`
        )
        .join("\n");
      return `                layer_${i} {
                        bindings = <
${bindings}
                        >;
                };`;
    })
    .join("\n")
);

function getMaxLineLength(lines: string[]) {
  return lines.reduce(
    (max, next) => (next.length > max ? next.length : max),
    lines[0].length
  );
}
