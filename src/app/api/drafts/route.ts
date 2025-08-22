import { NextResponse } from "next/server";
import { createDraft, listDrafts } from "@/lib/draftStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    const drafts = await listDrafts();
    return NextResponse.json(drafts);
}

export async function POST(request: Request) {
    const body = await request.json();
    const draft = await createDraft(body);
    return NextResponse.json(draft, { status: 201 });
}


