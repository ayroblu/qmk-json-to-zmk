import fs from "fs";
import {keymapper} from "./keymapper";
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
const result = layers.map((layer) => {
  return chunk(layer.map(keymapper), 12);
});

// printer part
console.log(
  result
    .map(
      (bindings) => `                layer {
                        bindings = <
${bindings.map((chunk) => `   ${chunk.join(" ")}`).join("\n")}
                        >;
                };`
    )
    .join("\n")
);
