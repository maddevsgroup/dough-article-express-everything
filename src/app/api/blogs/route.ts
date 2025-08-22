import { NextResponse } from "next/server";
import { createBlog, getBlogs } from "@/lib/blogStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    const blogs = await getBlogs();
    return NextResponse.json(blogs);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const blog = await createBlog(body);
        return NextResponse.json(blog, { status: 201 });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Invalid body";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}


