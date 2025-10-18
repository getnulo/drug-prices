import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const drugs = [
    { rxCui: "723", name: "Amoxicillin", forms: ["capsule","tablet"], strengths: ["250 mg","500 mg"] },
    { rxCui: "617314", name: "Atorvastatin", forms: ["tablet"], strengths: ["10 mg","20 mg","40 mg"] },
    { rxCui: "83367", name: "Metformin", forms: ["tablet"], strengths: ["500 mg","1000 mg"] },
  ];

  const zips = [
    { zip: "10001", city: "New York", state: "NY", lat: 40.7506, lng: -73.9970 },
    { zip: "94103", city: "San Francisco", state: "CA", lat: 37.7739, lng: -122.4114 },
    { zip: "78701", city: "Austin", state: "TX", lat: 30.2711, lng: -97.7437 },
  ];

  await prisma.drug.createMany({ data: drugs, skipDuplicates: true });
  await prisma.zip.createMany({ data: zips, skipDuplicates: true });
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
