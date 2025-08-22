export interface Draft {
    _id: string;
    title?: string;
    subtitle?: string;
    author?: string;
    tags?: string[];
    content?: string; // HTML from editor
    images?: string[]; // GridFS ids
    slug?: string; // optional desired slug on publish
    createdAt: string;
    updatedAt: string;
}

export interface DraftInput {
    title?: string;
    subtitle?: string;
    author?: string;
    tags?: string[];
    content?: string;
    images?: string[];
    slug?: string;
}


