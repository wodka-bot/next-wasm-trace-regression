import { exportCount } from "foxlike";
export const dynamic = "force-dynamic";
export async function GET() { return Response.json({ exports: exportCount() }); }
