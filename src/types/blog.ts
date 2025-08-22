export interface Blog {
    slug: string;
    title: string;
    subtitle?: string;
    author: string;
    tags: string[];
    content: string;
    images?: string[]; // GridFS file ids
    createdAt: string; // ISO timestamp
    updatedAt: string; // ISO timestamp
}

export interface NewBlogInput {
    title: string;
    subtitle?: string;
    author: string;
    tags: string[];
    content: string;
    slug?: string;
    images?: string[];
}


