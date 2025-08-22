"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";
import type { Blog, NewBlogInput } from "@/types/blog";
import type { Draft } from "@/types/draft";
import sanitizeHtml from "sanitize-html";

function TagInput({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
    const [text, setText] = useState("");
    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <input
                    className="input"
                    placeholder="Add tag"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => {
                        const t = text.trim();
                        if (!t) return;
                        onChange(Array.from(new Set([...value, t])));
                        setText("");
                    }}
                >
                    Add
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {value.map((t) => (
                    <span key={t} className="tag">
                        {t}
                        <button className="ml-2" onClick={() => onChange(value.filter((x) => x !== t))}>
                            ×
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
}

function WriterModule({ content, onChange }: { content: string; onChange: (v: string) => void }) {
    const [showPrompt, setShowPrompt] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const editorRef = useRef<HTMLDivElement | null>(null);
    const isSyncingRef = useRef(false);
    const editorId = "content-editor";
    function exec(command: string, value?: string) {
        const editor = editorRef.current;
        editor?.focus();
        document.execCommand(command, false, value);
        // Defer syncing to avoid selection glitches and React reconciliation issues
        setTimeout(() => {
            const html = editorRef.current?.innerHTML ?? "";
            if (html !== content) {
                isSyncingRef.current = true;
                onChange(html);
            }
        }, 0);
    }

    // Keep editor DOM in sync when content changes externally (AI/Reset/initial load)
    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;
        if (isSyncingRef.current) {
            // Skip one cycle caused by our own input/exec updates
            isSyncingRef.current = false;
            return;
        }
        if (editor.innerHTML !== content) {
            editor.innerHTML = content || "";
        }
    }, [content]);

    async function generate() {
        if (!aiPrompt.trim()) return;
        setLoading(true);
        try {
            const plain = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} });
            const res = await fetch("/api/ai/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: aiPrompt, existingContent: plain }),
            });
            const data = await res.json();
            if (data?.content) onChange(
                data.content
                    .split(/\n\n+/)
                    .map((p: string) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
                    .join("")
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="font-medium text-[var(--charcoal)]">Content</label>
                <button className="btn btn-secondary text-xs py-1" type="button" onClick={() => setShowPrompt((s) => !s)}>
                    {showPrompt ? "Hide AI write" : "Use AI write"}
                </button>
            </div>
            <div className="flex items-center gap-2 text-sm">
                <button type="button" className="btn btn-secondary px-2 py-1" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")}>B</button>
                <button type="button" className="btn btn-secondary px-2 py-1" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")}>I</button>
                <button type="button" className="btn btn-secondary px-2 py-1" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("underline")}>U</button>
                <button
                    type="button"
                    className="btn btn-secondary px-2 py-1"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                        const url = window.prompt("Link URL", "https://");
                        if (url) exec("createLink", url);
                    }}
                >
                    Link
                </button>
                <button type="button" className="btn btn-secondary px-2 py-1" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertOrderedList")}>OL</button>
                <button type="button" className="btn btn-secondary px-2 py-1" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertUnorderedList")}>UL</button>
                <button type="button" className="btn btn-secondary px-2 py-1" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("removeFormat")}>Clear</button>
            </div>
            <div
                id={editorId}
                ref={editorRef}
                className="min-h-48 border-2 border-[var(--charcoal)]/30 rounded-xl bg-white text-[var(--charcoal)] px-3 py-2 focus:outline-none"
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => {
                    isSyncingRef.current = true;
                    onChange((e.target as HTMLDivElement).innerHTML);
                }}
            />
            {/* Keep editor in sync when content changes externally (AI/Reset/initial) */}
            {(() => {
                // Using an IIFE with useEffect below to keep JSX tidy
                return null;
            })()}

            {showPrompt && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--charcoal)]">Prompt</label>
                    <input
                        className="input"
                        placeholder="Describe topic, audience, tone, constraints... (press Enter)"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                void generate();
                            }
                        }}
                    />
                    <div className="flex justify-between items-center text-xs text-gray-600">
                        <span>Press Enter to generate. {loading && "Generating..."}</span>
                        <button
                            type="button"
                            className="btn btn-secondary px-2 py-1"
                            onClick={() => {
                                setAiPrompt("");
                                onChange("");
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function BlogForm({ initial, onSubmit, onCancel, onSaveDraft }: { initial?: Partial<Blog>; onSubmit: (data: NewBlogInput) => void; onCancel: () => void; onSaveDraft?: (data: NewBlogInput) => void }) {
    const [title, setTitle] = useState(initial?.title ?? "");
    const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
    const [author, setAuthor] = useState(initial?.author ?? "");
    const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
    const [content, setContent] = useState(initial?.content ?? "");
    const [slug, setSlug] = useState(initial?.slug ?? "");
    const [images, setImages] = useState<string[]>(initial?.images ?? []);

    const disabled = useMemo(() => !title.trim() || !author.trim() || !content.trim(), [title, author, content]);
    const anyFilled = useMemo(() => {
        return (
            !!title.trim() || !!subtitle?.trim() || !!author.trim() || tags.length > 0 || !!content.trim() || !!slug.trim() || images.length > 0
        );
    }, [title, subtitle, author, tags, content, slug, images]);

    return (
        <form
            className="space-y-3"
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit({ title, subtitle: subtitle || undefined, author, tags, content, images, slug: slug || undefined });
            }}
        >
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-[var(--charcoal)]">Title</label>
                    <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[var(--charcoal)]">Subtitle</label>
                    <input className="input" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[var(--charcoal)]">Author</label>
                    <input className="input" value={author} onChange={(e) => setAuthor(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[var(--charcoal)]">Slug (optional)</label>
                    <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-[var(--charcoal)]">Tags</label>
                    <TagInput value={tags} onChange={setTags} />
                </div>
                <div className="col-span-2">
                    <WriterModule content={content} onChange={setContent} />
                </div>
                <div className="col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-[var(--charcoal)]">Images (up to 9)</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={async (e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length === 0) return;
                            const remain = 9 - images.length;
                            const toUpload = files.slice(0, Math.max(0, remain));
                            const uploaded: string[] = [];
                            for (const f of toUpload) {
                                const fd = new FormData();
                                fd.append("file", f);
                                const res = await fetch("/api/images", { method: "POST", body: fd });
                                const data = await res.json();
                                if (data?.id) uploaded.push(data.id);
                            }
                            setImages((prev) => [...prev, ...uploaded]);
                            (e.target as HTMLInputElement).value = "";
                        }}
                        className="block"
                    />
                    <div className="grid grid-cols-3 gap-2">
                        {images.map((id) => (
                            <div key={id} className="relative group">
                                <img src={`/api/images/${id}`} alt="blog" className="w-full h-24 object-cover rounded" />
                                <button
                                    type="button"
                                    className="absolute top-1 right-1 btn btn-danger px-2 py-0.5 text-xs opacity-90"
                                    onClick={async () => {
                                        await fetch(`/api/images/${id}`, { method: "DELETE" });
                                        setImages((prev) => prev.filter((x) => x !== id));
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex gap-2 justify-end">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                {onSaveDraft && (
                    <button type="button" className="btn btn-secondary disabled:opacity-50" disabled={!anyFilled} onClick={() => onSaveDraft({ title, subtitle: subtitle || undefined, author, tags, content, images, slug: slug || undefined })}>
                        Save Draft
                    </button>
                )}
                <button type="submit" className="btn btn-primary disabled:opacity-50" disabled={disabled}>
                    Save
                </button>
            </div>
        </form>
    );
}

export default function ManagementPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(true);
    const [openCreate, setOpenCreate] = useState(false);
    const [editSlug, setEditSlug] = useState<string | null>(null);
    const [editDraftId, setEditDraftId] = useState<string | null>(null);
    const [tab, setTab] = useState<"blogs" | "drafts">("blogs");

    async function load() {
        setLoading(true);
        const res = await fetch("/api/blogs");
        const data = await res.json();
        setBlogs(data);
        setLoading(false);
    }

    async function loadDrafts() {
        const res = await fetch("/api/drafts");
        const data = await res.json();
        setDrafts(data);
    }

    useEffect(() => {
        load();
        loadDrafts();
    }, []);

    async function create(data: NewBlogInput) {
        await fetch("/api/blogs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        setOpenCreate(false);
        await load();
        await loadDrafts();
    }

    async function update(slug: string, data: NewBlogInput) {
        await fetch(`/api/blogs/${slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        setEditSlug(null);
        await load();
        await loadDrafts();
    }

    async function remove(slug: string) {
        await fetch(`/api/blogs/${slug}`, { method: "DELETE" });
        await load();
    }

    async function saveDraft(data: NewBlogInput) {
        await fetch("/api/drafts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        await loadDrafts();
    }

    async function updateDraft(id: string, data: NewBlogInput) {
        await fetch(`/api/drafts/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        await loadDrafts();
    }

    async function deleteDraft(id: string) {
        await fetch(`/api/drafts/${id}`, { method: "DELETE" });
        await loadDrafts();
    }

    async function publishFromDraft(id: string, data: NewBlogInput) {
        await fetch("/api/blogs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        await deleteDraft(id);
        setEditDraftId(null);
        await load();
    }

    const editBlog = blogs.find((b) => b.slug === editSlug) ?? undefined;
    const editDraft = drafts.find((d) => d._id === editDraftId) ?? undefined;

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-extrabold tracking-tight">Article Management</h1>
                    <div className="flex gap-1">
                        <button className={`btn btn-secondary px-3 py-1 ${tab === "blogs" ? "ring-2 ring-red-500" : ""}`} onClick={() => setTab("blogs")}>Published</button>
                        <button className={`btn btn-secondary px-3 py-1 ${tab === "drafts" ? "ring-2 ring-red-500" : ""}`} onClick={() => setTab("drafts")}>Drafts</button>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => setOpenCreate(true)}>
                    + Create Blog
                </button>
            </div>
            {loading && tab === "blogs" ? (
                <p>Loading...</p>
            ) : tab === "blogs" ? (
                <div className="space-y-2">
                    {blogs.length === 0 && <p className="text-sm text-gray-500">No blogs yet.</p>}
                    {blogs.map((b) => (
                        <div key={b.slug} className="card flex items-center justify-between">
                            <div>
                                <div className="font-semibold">{b.title}</div>
                                <div className="text-sm text-gray-600">/{b.slug}</div>
                                <div className="text-xs text-gray-500">By {b.author}</div>
                            </div>
                            <div className="flex gap-2">
                                <a className="btn btn-secondary" href={`/blog/${b.slug}`}>
                                    View
                                </a>
                                <button className="btn btn-secondary" onClick={() => setEditSlug(b.slug)}>
                                    Edit
                                </button>
                                <button className="btn btn-danger" onClick={() => remove(b.slug)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {drafts.length === 0 && <p className="text-sm text-gray-500">No drafts yet.</p>}
                    {drafts.map((d) => (
                        <div key={d._id} className="card flex items-center justify-between">
                            <div>
                                <div className="font-semibold">{d.title || "(Untitled)"}</div>
                                <div className="text-xs text-gray-500">Last updated {new Date(d.updatedAt).toLocaleString()}</div>
                            </div>
                            <div className="flex gap-2">
                                <button className="btn btn-secondary" onClick={() => setEditDraftId(d._id)}>
                                    Edit
                                </button>
                                <button className="btn btn-danger" onClick={() => deleteDraft(d._id)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create dialog */}
            <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
                <div className="fixed inset-0 bg-white/60" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="card w-full max-w-2xl">
                        <Dialog.Title className="text-lg font-semibold mb-4">Create Blog</Dialog.Title>
                        <BlogForm onSubmit={create} onCancel={() => setOpenCreate(false)} onSaveDraft={saveDraft} />
                    </Dialog.Panel>
                </div>
            </Dialog>

            {/* Edit dialog */}
            <Dialog open={!!editSlug} onClose={() => setEditSlug(null)}>
                <div className="fixed inset-0 bg-white/60" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="card w-full max-w-2xl">
                        <Dialog.Title className="text-lg font-semibold mb-4">Edit Blog</Dialog.Title>
                        {editBlog && (
                            <BlogForm initial={editBlog} onSubmit={(d) => update(editBlog.slug, d)} onCancel={() => setEditSlug(null)} onSaveDraft={saveDraft} />
                        )}
                    </Dialog.Panel>
                </div>
            </Dialog>

            {/* Edit Draft dialog */}
            <Dialog open={!!editDraftId} onClose={() => setEditDraftId(null)}>
                <div className="fixed inset-0 bg-white/60" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="card w-full max-w-2xl">
                        <Dialog.Title className="text-lg font-semibold mb-4">Edit Draft</Dialog.Title>
                        {editDraft && (
                            <BlogForm
                                initial={{
                                    title: editDraft.title,
                                    subtitle: editDraft.subtitle,
                                    author: editDraft.author,
                                    tags: editDraft.tags || [],
                                    content: editDraft.content || "",
                                    images: editDraft.images || [],
                                    slug: editDraft.slug,
                                }}
                                onSubmit={(d) => publishFromDraft(editDraft._id, d)}
                                onCancel={() => setEditDraftId(null)}
                                onSaveDraft={(d) => updateDraft(editDraft._id, d)}
                            />
                        )}
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    );
}


