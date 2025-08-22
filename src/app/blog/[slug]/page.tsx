import { getBlogBySlug } from "@/lib/blogStore";
import { notFound } from "next/navigation";
import sanitizeHtml from "sanitize-html";

type Context = { params: Promise<{ slug: string }> };

export default async function BlogDetailPage({ params }: Context) {
    const { slug } = await params;
    const blog = await getBlogBySlug(slug);
    if (!blog) return notFound();
    return (
        <article className="p-6">
            <div className="space-y-2 mb-4">
                <h1 className="text-3xl font-bold">{blog.title}</h1>
                {blog.subtitle && <p className="text-gray-600">{blog.subtitle}</p>}
                <p className="text-sm text-gray-500">By {blog.author}</p>
                <div className="my-2 flex gap-2 flex-wrap">
                    {blog.tags.map((t) => (
                        <span key={t} className="tag">
                            {t}
                        </span>
                    ))}
                </div>
                {!!blog.images?.length && (
                    <div className="grid grid-cols-3 gap-2">
                        {blog.images.slice(0, 9).map((id) => (
                            <img key={id} src={`/api/images/${id}`} alt="blog" className="w-full h-32 object-cover rounded" />
                        ))}
                    </div>
                )}
            </div>
            <div className="prose prose-zinc dark:prose-invert max-w-none" dangerouslySetInnerHTML={{
                __html: sanitizeHtml(blog.content, {
                    allowedTags: [
                        "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li", "h1", "h2", "h3", "blockquote", "code", "pre"
                    ],
                    allowedAttributes: {
                        a: ["href", "title", "target", "rel"],
                    },
                    transformTags: {
                        a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' })
                    }
                })
            }} />
        </article>
    );
}


