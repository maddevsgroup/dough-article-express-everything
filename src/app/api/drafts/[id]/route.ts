import { NextRequest, NextResponse } from "next/server";
import { deleteDraft, getDraft, updateDraft } from "@/lib/draftStore";

type Context = { params: Promise<{ id: string }> };

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, context: Context) {
    const { id } = await context.params;
    const draft = await getDraft(id);
    if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(draft);
}

export async function PUT(request: NextRequest, context: Context) {
    const { id } = await context.params;
    const body = await request.json();
    const updated = await updateDraft(id, body);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, context: Context) {
    const { id } = await context.params;
    const ok = await deleteDraft(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
}


