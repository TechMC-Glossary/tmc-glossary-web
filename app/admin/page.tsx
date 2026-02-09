// app/admin/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import RequestList from "./RequestList";

export default async function AdminPage() {
  const session = await auth();
  // @ts-ignore
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/');
  }

  const pendingRequests = await prisma.request.findMany({
    where: { status: 'PENDING' },
    include: {
        user: {
            select: { email: true, name: true }
        }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  // Transform dates to strings to avoid hydration issues passing to client
  const serializedRequests = pendingRequests.map(req => ({
      ...req,
      createdAt: req.createdAt.toISOString(),
      updatedAt: req.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="bg-card rounded-lg border shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
          <RequestList initialRequests={serializedRequests} />
      </div>
    </div>
  )
}
