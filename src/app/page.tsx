import Link from "next/link";

export default function Home() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Article</h1>
      <p className="text-gray-600">AI-enabled blog application.</p>
      <div className="flex gap-3">
        <Link className="px-3 py-1 border rounded" href="/blog">
          Browse Blogs
        </Link>
        <Link className="px-3 py-1 border rounded" href="/management">
          Management
        </Link>
      </div>
    </main>
  );
}
