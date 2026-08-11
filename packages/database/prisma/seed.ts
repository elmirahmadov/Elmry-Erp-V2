import { PrismaClient } from "../generated/client";
import bcrypt from "bcrypt";
import { config } from "dotenv";
import path from "path";
import fs from "fs";

function loadRootEnv() {
  let dir = __dirname;
  while (true) {
    const turbo = path.join(dir, "turbo.json");
    const envFile = path.join(dir, ".env");
    if (fs.existsSync(turbo) && fs.existsSync(envFile)) {
      config({ path: envFile });
      return;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  config();
}

loadRootEnv();

const prisma = new PrismaClient();

async function seedCompany(options: {
  companyName: string;
  ownerName: string;
  ownerSurname: string;
  phone: string;
  branchName: string;
  email: string;
  userName: string;
  password: string;
}) {
  const company = await prisma.company.upsert({
    where: { name: options.companyName },
    update: {},
    create: {
      name: options.companyName,
      ownerName: options.ownerName,
      ownerSurname: options.ownerSurname,
      birthDate: new Date("1990-01-01"),
      phone: options.phone,
    },
  });

  let branch = await prisma.branch.findFirst({
    where: { name: options.branchName, companyId: company.id },
  });
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        name: options.branchName,
        companyId: company.id,
      },
    });
  }

  const hashedPassword = await bcrypt.hash(options.password, 10);
  const user = await prisma.user.upsert({
    where: { email: options.email },
    update: {
      companyId: company.id,
      password: hashedPassword,
      name: options.userName,
      roleId: 1,
    },
    create: {
      email: options.email,
      name: options.userName,
      password: hashedPassword,
      companyId: company.id,
      roleId: 1,
    },
  });

  await prisma.branchUser.upsert({
    where: {
      branchId_userId: {
        branchId: branch.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      branchId: branch.id,
      userId: user.id,
    },
  });

  let warehouse = await prisma.warehouse.findFirst({
    where: { companyId: company.id, name: "Demo Anbar" },
  });
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: {
        name: "Demo Anbar",
        companyId: company.id,
      },
    });
  }

  await prisma.branchWarehouse.upsert({
    where: {
      branchId_warehouseId: {
        branchId: branch.id,
        warehouseId: warehouse.id,
      },
    },
    update: {},
    create: {
      branchId: branch.id,
      warehouseId: warehouse.id,
    },
  });

  let till = await prisma.till.findFirst({
    where: { companyId: company.id, name: "Demo Kassa" },
  });
  if (!till) {
    till = await prisma.till.create({
      data: {
        name: "Demo Kassa",
        companyId: company.id,
        balance: 0,
        status: "active",
      },
    });
  }

  await prisma.branchTill.upsert({
    where: {
      branchId_tillId: {
        branchId: branch.id,
        tillId: till.id,
      },
    },
    update: {},
    create: {
      branchId: branch.id,
      tillId: till.id,
    },
  });

  return {
    company,
    branch,
    user,
    warehouse,
    till,
    password: options.password,
  };
}

async function main() {
  const demo = await seedCompany({
    companyName: "Demo",
    ownerName: "Demo",
    ownerSurname: "Admin",
    phone: "+994500000001",
    branchName: "Demo Merkez",
    email: "admin@demo.com",
    userName: "Demo Admin",
    password: "demo12345",
  });

  console.log("Database seeded successfully!");
  console.log("--- Demo ---");
  console.log(`Company: ${demo.company.name}`);
  console.log(`Branch: ${demo.branch.name}`);
  console.log(`Warehouse: ${demo.warehouse.name}`);
  console.log(`Till: ${demo.till.name}`);
  console.log(`Email: ${demo.user.email}`);
  console.log(`Password: ${demo.password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
