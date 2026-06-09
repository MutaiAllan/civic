import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COMPLAINTS = [
  { rawText: "The road on Kimathi Street has large potholes causing accidents.", category: "Infrastructure", department: "Roads & Transport",      sentimentLabel: "NEGATIVE" as const, status: "PENDING"     as const },
  { rawText: "Public health clinic ran out of malaria medication again.",        category: "Health",         department: "Ministry of Health",      sentimentLabel: "NEGATIVE" as const, status: "IN_PROGRESS" as const },
  { rawText: "The new community park in Westlands is well maintained.",          category: "Environment",    department: "Parks & Recreation",      sentimentLabel: "POSITIVE" as const, status: "RESOLVED"    as const },
  { rawText: "Garbage collection in Eastleigh has not happened in two weeks.",   category: "Sanitation",     department: "Sanitation Authority",    sentimentLabel: "NEGATIVE" as const, status: "PENDING"     as const },
  { rawText: "Water supply was restored quickly after the outage. Great job.",   category: "Utilities",      department: "Water & Sewerage",        sentimentLabel: "POSITIVE" as const, status: "RESOLVED"    as const },
  { rawText: "Street lights along Ngong Road have been broken for a month.",     category: "Infrastructure", department: "Roads & Transport",       sentimentLabel: "NEGATIVE" as const, status: "IN_PROGRESS" as const },
  { rawText: "Construction noise near CBD is unbearable past midnight.",         category: "Environment",    department: "Environment & Planning",  sentimentLabel: "NEGATIVE" as const, status: "PENDING"     as const },
  { rawText: "School feeding program is working well in Mathare North.",         category: "Education",      department: "Ministry of Education",   sentimentLabel: "POSITIVE" as const, status: "RESOLVED"    as const },
  { rawText: "Bribery demand at city council licensing office on 3rd floor.",    category: "Governance",     department: "Ethics & Integrity",      sentimentLabel: "NEGATIVE" as const, status: "IN_PROGRESS" as const },
  { rawText: "Traffic management around the CBD is somewhat better now.",        category: "Infrastructure", department: "Roads & Transport",       sentimentLabel: "NEUTRAL"  as const, status: "RESOLVED"    as const },
];

async function main() {
  console.log("Seeding database…");

  // Create demo citizen
  const citizen = await prisma.user.upsert({
    where:  { email: "citizen@demo.caes.ke" },
    update: {},
    create: { email: "citizen@demo.caes.ke", role: "CITIZEN" },
  });

  // Create demo admin
  await prisma.user.upsert({
    where:  { email: "admin@demo.caes.ke" },
    update: {},
    create: { email: "admin@demo.caes.ke", role: "ADMIN" },
  });

  // Seed complaints
  for (const c of COMPLAINTS) {
    await prisma.complaint.create({
      data: { userId: citizen.id, ...c },
    });
  }

  console.log(`Seeded ${COMPLAINTS.length} complaints. Done.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
