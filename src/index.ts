import fs from "fs";
import { keymapper } from "./keymapper";
import { chunk } from "./utils";

const isKyria = process.argv[2] === '--kyria'
const filePath = process.argv[isKyria ? 3 : 2];

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
  if (isKyria) {
    rows[0].push('     ', '     ')
    rows[1].unshift('     ', '     ')
    rows[2].push('     ', '     ')
    rows[3].unshift('     ', '     ')
    rows[4].push('&none', '&none')
    rows[5].unshift('&none', '&none')
    rows[6].push('&trans')
    rows[6].unshift('&trans')
    rows[7].push('&trans')
    rows[7].unshift('&trans')
  }
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
      if (isKyria) {
        return `    layer_${i} {
      bindings = <
${bindings}
      >;
    };`;
      } else {
        return `                layer_${i} {
                        bindings = <
${bindings}
                        >;
                };`;
      }
    })
    .join("\n")
);

function getMaxLineLength(lines: string[]) {
  return lines.reduce(
    (max, next) => (next.length > max ? next.length : max),
    lines[0].length
  );
}
