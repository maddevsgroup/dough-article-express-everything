import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const { prompt, existingContent } = await request.json();
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
        }
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const userBrief = String(prompt ?? "").trim();
        const current = String(existingContent ?? "").trim();

        const directive = current
            ? [
                "You are a professional blog writer.",
                "Revise ONLY the following blog body content according to the user's instruction.",
                "Strict rules:",
                "- Output body text only. No title, headings, greetings, meta, or explanations.",
                "- Preserve meaning and structure unless the instruction asks otherwise.",
                "- Do NOT include phrases like 'Sure', 'Here is', 'As an AI', etc.",
                "- Do NOT include 'Title:', 'Introduction', 'Conclusion', or section labels.",
                "- Plain text paragraphs only. No markdown code fences.",
                "- Format as paragraphs separated by a blank line.",
                "Current body content (edit this):",
                `"""${current}"""`,
                "User instruction:",
                `"""${userBrief}"""`,
                "Return only the revised body between <CONTENT> and </CONTENT>.",
                "<CONTENT>",
            ].join("\n")
            : [
                "You are a professional blog writer.",
                "Write ONLY the main body content of a blog post based on the user's brief.",
                "Strict rules:",
                "- Output body text only. No title, headings, greetings, meta, or explanations.",
                "- Do NOT include phrases like 'Sure', 'Here is', 'As an AI', etc.",
                "- Do NOT include 'Title:', 'Introduction', 'Conclusion', or section labels.",
                "- Plain text paragraphs only. No markdown code fences.",
                "- Format as paragraphs separated by a blank line.",
                "User brief:",
                `"""${userBrief}"""`,
                "Return only the body between <CONTENT> and </CONTENT>.",
                "<CONTENT>",
            ].join("\n");

        const result = await model.generateContent(directive);
        let text = result.response.text();

        // Prefer content between markers; fallback to sanitization
        const match = text.match(/<CONTENT>([\s\S]*?)<\/CONTENT>/i);
        if (match) {
            text = match[1].trim();
        } else {
            text = text
                .replace(/```[\s\S]*?```/g, "")
                .replace(/^\s*(sure|here(?:'| i)s|absolutely|of course|certainly|let(?:'| )?s|as an ai|great question[^\n]*):?\s*/i, "")
                .replace(/^\s*title\s*:\s*.*$/gim, "")
                .replace(/^\s*introduction\s*:?\s*$/gim, "")
                .replace(/^\s*conclusion\s*:?\s*$/gim, "")
                .replace(/^\s*#+\s+.*$/gim, "")
                .trim();
        }

        // Remove any stray markers and normalize paragraph breaks
        text = text
            .replace(/<\/?CONTENT>/gi, "")
            .replace(/\r\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();

        return NextResponse.json({ content: text });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Failed to generate";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}


