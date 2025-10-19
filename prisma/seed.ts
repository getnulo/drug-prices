import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.drug.deleteMany(); // reset for the demo

  await prisma.drug.createMany({
    data: [
      {
        rxCui: "723", // examples
        name: "Amoxicillin",
        forms: ["capsule", "tablet"],
        strengths: ["250 mg", "500 mg"]
      },
      {
        rxCui: "617314",
        name: "Atorvastatin",
        forms: ["tablet"],
        strengths: ["10 mg", "20 mg", "40 mg"]
      },
      {
        rxCui: "351457",
        name: "Metformin",
        forms: ["tablet"],
        strengths: ["500 mg", "850 mg", "1000 mg"]
      }
    ],
    skipDuplicates: true
  });

  console.log("Seeded basic drugs ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
