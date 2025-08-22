import Link from "next/link";
import { getBlogs } from "@/lib/blogStore";

export default async function BlogListPage() {
    const blogs = await getBlogs();
    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Blogs</h1>
            <div className="grid gap-3">
                {blogs.length === 0 && <p className="text-sm text-gray-500">No blogs yet.</p>}
                {blogs.map((b) => (
                    <Link key={b.slug} className="card hover:bg-gray-50 dark:hover:bg-zinc-800" href={`/blog/${b.slug}`}>
                        <div className="font-semibold">{b.title}</div>
                        {b.subtitle && <div className="text-sm text-gray-600">{b.subtitle}</div>}
                        <div className="text-xs text-gray-500">By {b.author}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}


