import { getDb } from "@/lib/mongo";
import { Draft, DraftInput } from "@/types/draft";
import { ObjectId } from "mongodb";

type DraftDb = Omit<Draft, "_id"> & { _id: ObjectId };

async function draftsCollection() {
    const db = await getDb();
    const col = db.collection<DraftDb>("drafts");
    await col.createIndex({ updatedAt: -1 });
    return col;
}

export async function listDrafts(): Promise<Draft[]> {
    const col = await draftsCollection();
    const drafts = await col.find({}).sort({ updatedAt: -1 }).toArray();
    return drafts.map((d) => ({ ...d, _id: d._id.toString() }));
}

export async function getDraft(id: string): Promise<Draft | undefined> {
    const col = await draftsCollection();
    try {
        const doc = await col.findOne({ _id: new ObjectId(id) });
        return doc ? { ...doc, _id: doc._id.toString() } : undefined;
    } catch {
        return undefined;
    }
}

export async function createDraft(input: DraftInput): Promise<Draft> {
    const col = await draftsCollection();
    const now = new Date().toISOString();
    const _id = new ObjectId();
    const draftDoc: DraftDb = {
        _id,
        title: input.title,
        subtitle: input.subtitle,
        author: input.author,
        tags: input.tags ?? [],
        content: input.content,
        images: input.images ?? [],
        slug: input.slug,
        createdAt: now,
        updatedAt: now,
    };
    await col.insertOne(draftDoc);
    return { ...draftDoc, _id: draftDoc._id.toString() } as Draft;
}

export async function updateDraft(id: string, input: DraftInput): Promise<Draft | undefined> {
    const col = await draftsCollection();
    const _id = new ObjectId(id);
    await col.updateOne({ _id }, { $set: { ...input, updatedAt: new Date().toISOString() } });
    const doc = await col.findOne({ _id });
    return doc ? { ...doc, _id: doc._id.toString() } : undefined;
}

export async function deleteDraft(id: string): Promise<boolean> {
    const col = await draftsCollection();
    try {
        const res = await col.deleteOne({ _id: new ObjectId(id) });
        return res.deletedCount === 1;
    } catch {
        return false;
    }
}


