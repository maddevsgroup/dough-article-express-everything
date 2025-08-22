import { NextRequest, NextResponse } from "next/server";
import { getBucket } from "@/lib/mongo";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, context: Context) {
    const bucket = await getBucket();
    try {
        const { id: idParam } = await context.params;
        const id = new ObjectId(idParam);
        const download = bucket.openDownloadStream(id);
        const chunks: Buffer[] = [];
        const data = await new Promise<Buffer>((resolve, reject) => {
            download.on("data", (c) => chunks.push(c as Buffer));
            download.on("end", () => resolve(Buffer.concat(chunks)));
            download.on("error", reject);
        });
        // Content type is not trivially available here; default to octet-stream
        const body = new Uint8Array(data);
        return new NextResponse(body, { headers: { "Content-Type": "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" } });
    } catch {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
}

export async function DELETE(_: NextRequest, context: Context) {
    const bucket = await getBucket();
    try {
        const { id: idParam } = await context.params;
        const id = new ObjectId(idParam);
        await bucket.delete(id);
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
}


