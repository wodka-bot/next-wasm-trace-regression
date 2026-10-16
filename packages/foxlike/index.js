import * as wasm from "./tiny.wasm";
export function exportCount() { return Object.keys(wasm).length; }
