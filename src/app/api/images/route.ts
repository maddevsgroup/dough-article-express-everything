import { NextResponse } from "next/server";
import { getBucket } from "@/lib/mongo";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
        return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    const bucket = await getBucket();
    const id = new ObjectId();
    const uploadStream = bucket.openUploadStreamWithId(id, file.name, {
        contentType: file.type || "application/octet-stream",
    });
    const arrayBuffer = await file.arrayBuffer();
    await new Promise<void>((resolve, reject) => {
        uploadStream.on("finish", resolve);
        uploadStream.on("error", reject);
        uploadStream.end(Buffer.from(arrayBuffer));
    });
    return NextResponse.json({ id: id.toHexString() }, { status: 201 });
}


