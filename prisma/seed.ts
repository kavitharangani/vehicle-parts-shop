import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "Shop Admin",
      username: "admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const categoryNames = [
    "Engine Parts",
    "Brake Parts",
    "Suspension",
    "Electrical",
    "Body Parts",
    "Filters",
    "Lubricants",
    "Tyres & Wheels",
  ];

  for (const name of categoryNames) {
    await prisma.category.upsert({
      where: { categoryName: name },
      update: {},
      create: { categoryName: name },
    });
  }

  console.log("Seed complete.");
  console.log("Login with username: admin / password: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
