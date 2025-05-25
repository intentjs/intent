/**
 *  * Register hook to process TypeScript files using ts-node
 */
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("ts-node/esm", pathToFileURL("./"));
