import { NextRequest, NextResponse } from "next/server";
import { deleteBlog, getBlogBySlug, updateBlog } from "@/lib/blogStore";

type Context = { params: Promise<{ slug: string }> };

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, context: Context) {
    const { slug } = await context.params;
    const blog = await getBlogBySlug(slug);
    if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(blog);
}

export async function PUT(request: NextRequest, context: Context) {
    const { slug } = await context.params;
    const body = await request.json();
    const updated = await updateBlog(slug, body);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, context: Context) {
    const { slug } = await context.params;
    const ok = await deleteBlog(slug);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
}


