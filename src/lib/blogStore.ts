import { Blog, NewBlogInput } from "@/types/blog";
import { getDb } from "@/lib/mongo";

function slugify(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

async function blogsCollection() {
    const db = await getDb();
    const collection = db.collection<Blog>("blogs");
    // Ensure unique slug index
    await collection.createIndex({ slug: 1 }, { unique: true });
    return collection;
}

export async function getBlogs(): Promise<Blog[]> {
    const col = await blogsCollection();
    const docs = await col
        .find({}, { projection: { _id: 0 } })
        .sort({ updatedAt: -1 })
        .toArray();
    return docs;
}

export async function getBlogBySlug(slug: string): Promise<Blog | undefined> {
    const col = await blogsCollection();
    const doc = await col.findOne({ slug }, { projection: { _id: 0 } });
    return doc ?? undefined;
}

export async function createBlog(input: NewBlogInput): Promise<Blog> {
    const col = await blogsCollection();
    const now = new Date().toISOString();
    const baseSlug = input.slug && input.slug.trim().length > 0 ? slugify(input.slug) : slugify(input.title);
    let uniqueSlug = baseSlug;
    let suffix = 1;

    // Try until unique
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const exists = await col.findOne({ slug: uniqueSlug }, { projection: { _id: 1 } });
        if (!exists) break;
        uniqueSlug = `${baseSlug}-${suffix++}`;
    }

    const blog: Blog = {
        slug: uniqueSlug,
        title: input.title,
        subtitle: input.subtitle,
        author: input.author,
        tags: input.tags,
        content: input.content,
        images: input.images ?? [],
        createdAt: now,
        updatedAt: now,
    };

    await col.insertOne(blog);
    return blog;
}

export async function updateBlog(slug: string, input: Partial<NewBlogInput>): Promise<Blog | undefined> {
    const col = await blogsCollection();

    let newSlug = slug;
    if (input.slug && input.slug.trim().length > 0) {
        const desired = slugify(input.slug);
        if (desired !== slug) {
            const exists = await col.findOne({ slug: desired }, { projection: { _id: 1 } });
            if (!exists) newSlug = desired;
        }
    }

    const update: Partial<Blog> = {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.subtitle !== undefined ? { subtitle: input.subtitle } : {}),
        ...(input.author !== undefined ? { author: input.author } : {}),
        ...(input.tags !== undefined ? { tags: input.tags ?? [] } : {}),
        ...(input.content !== undefined ? { content: input.content } : {}),
        ...(input.images !== undefined ? { images: input.images ?? [] } : {}),
        slug: newSlug,
        updatedAt: new Date().toISOString(),
    };

    const res = await col.findOneAndUpdate(
        { slug },
        { $set: update },
        { returnDocument: "after", projection: { _id: 0 } }
    );
    const value = (res as unknown as { value: Blog | null } | null)?.value ?? null;
    return value ?? undefined;
}

export async function deleteBlog(slug: string): Promise<boolean> {
    const col = await blogsCollection();
    const res = await col.deleteOne({ slug });
    return res.deletedCount === 1;
}


