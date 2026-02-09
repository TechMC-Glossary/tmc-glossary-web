// app/api/admin/reject/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    // @ts-ignore
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { requestId } = await req.json();
        await prisma.request.update({
            where: { id: requestId },
            data: { status: 'REJECTED' }
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
