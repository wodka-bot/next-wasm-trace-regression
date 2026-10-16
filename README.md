# Next 16.4 traces every package.json dependency into a route that imports WebAssembly from a workspace package

Minimal pnpm workspace. `apps/web` has one App Route handler, `app/api/x/route.ts`, that imports
`foxlike`, a workspace package whose `index.js` does `import * as wasm from "./tiny.wasm"`
(the shape wasm-bindgen emits). `tiny.wasm` is the 8-byte empty module.

`apps/web` also lists a few dependencies the route never touches: `dayjs`, `zod`, and the
devDependency `typescript`.

## Reproduce

```sh
pnpm install
pnpm --filter web build
node -e '
  const fs=require("fs"),p="apps/web/.next/server/app/api/x/route.js.nft.json";
  const f=JSON.parse(fs.readFileSync(p)).files;
  const pk=new Set(f.map(x=>x.split("node_modules/").pop().split("/")[0]));
  console.log(f.length,"files; dayjs:",pk.has("dayjs"),"zod:",pk.has("zod"),"typescript:",pk.has("typescript"))'
```

Switch the `next` version in `apps/web/package.json` and rerun `pnpm install` to compare.

## Results

| next | `api/x/route.js.nft.json` files | includes `dayjs` / `zod` / `typescript` |
|---|---|---|
| 16.3.8 | 124 | no |
| 16.4.1 | 5388 | yes |
| 16.5.0-canary.14 | 5400 | yes |

`app/page.js.nft.json` (no wasm in its graph) stays at ~130 files on every version.

The trace on 16.4 contains the whole `next` package (including `dist/docs`), every dependency
and devDependency declared in `apps/web/package.json`, and the full `packages/foxlike` directory.
None of them are referenced by the route's chunks. Running `@vercel/nft` directly over the
route's emitted chunks traces only the chunks, the wasm file and `next`'s runtime files.

In a real monorepo (pnpm, ~70 direct dependencies, four routes that reach one wasm-bindgen
module) this takes the route from 200 MB to 474 MB uncompressed and fails the Vercel 250 MB
function limit. The only module shared by the affected routes and absent from every other
route is Turbopack's embedded `[turbopack-wasm]/node/loadWasm.ts`.
