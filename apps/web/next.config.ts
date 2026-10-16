import path from "node:path";
import type { NextConfig } from "next";
const c: NextConfig = { transpilePackages: ["foxlike"], outputFileTracingRoot: path.join(__dirname, "../..") };
export default c;
