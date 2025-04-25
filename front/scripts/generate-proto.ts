import { load } from "protobufjs";
import { writeFileSync } from "fs";
import { join } from "path";

async function generateTypes() {
  const root = await load(join(__dirname, "../shared/proto/auth.proto"));
  const types = root.toJSON();
  writeFileSync(
    join(__dirname, "../proto/auth.ts"),
    `export const types = ${JSON.stringify(types, null, 2)}`
  );
}

generateTypes();
