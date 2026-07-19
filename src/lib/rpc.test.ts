import { getRpcClient } from "./rpc";

try {
  getRpcClient("default");
  console.log("OK");
} catch (err) {
  console.error(err);
}
