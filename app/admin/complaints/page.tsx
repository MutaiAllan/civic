import { prisma } from "@/lib/prisma";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminComplaintsPage() {
  const [complaints, byStatus, bySentiment, byCategory] = await Promise.all([
    prisma.complaint.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } },
    }),
    prisma.complaint.groupBy({ by: ["status"],         _count: { id: true } }),
    prisma.complaint.groupBy({ by: ["sentimentLabel"], _count: { id: true } }),
    prisma.complaint.groupBy({ by: ["category"],       _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
  ]);

  return (
    <AdminDashboard
      complaints={complaints}
      analytics={{ byStatus, bySentiment, byCategory }}
      defaultTab="complaints"
    />
  );
}
