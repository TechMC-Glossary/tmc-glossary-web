// app/api/request/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { type, payload, originalTerm } = body;

        // Basic validation
        if (!payload) return NextResponse.json({ error: "Missing payload" }, { status: 400 });

        const request = await prisma.request.create({
            data: {
                type,
                payload: JSON.stringify(payload),
                originalTerm: originalTerm ? JSON.stringify(originalTerm) : null,
                userId: session.user.id,
            }
        });

        return NextResponse.json(request);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
    }
}
