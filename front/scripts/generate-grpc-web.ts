import { execSync } from "child_process";
import { join } from "path";

const protoPath = join(__dirname, "../back/shared/proto/auth.proto");
const outputPath = join(__dirname, "../back/shared/generated");

execSync(
  `protoc -I=${protoPath} --js_out=import_style=commonjs,binary:${outputPath} --grpc-web_out=import_style=typescript,mode=grpcwebtext:${outputPath} ${protoPath}`
);
