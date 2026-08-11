import { prisma } from "@elmry/database";

export class CompanyRepository {
  async create(data: {
    name: string;
    ownerName: string;
    ownerSurname: string;
    birthDate: string | Date;
    phone: string;
    extraPhone?: string | null;
    email?: string | null;
    imageUrl?: string | null;
  }) {
    return await prisma.company.create({
      data: {
        name: data.name,
        ownerName: data.ownerName,
        ownerSurname: data.ownerSurname,
        birthDate: new Date(data.birthDate),
        phone: data.phone,
        extraPhone: data.extraPhone ?? null,
        email: data.email ?? null,
        imageUrl: data.imageUrl ?? null,
      },
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      ownerName?: string;
      ownerSurname?: string;
      birthDate?: string | Date;
      phone?: string;
      extraPhone?: string | null;
      email?: string | null;
      imageUrl?: string | null;
    },
  ) {
    return await prisma.company.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.ownerName !== undefined ? { ownerName: data.ownerName } : {}),
        ...(data.ownerSurname !== undefined
          ? { ownerSurname: data.ownerSurname }
          : {}),
        ...(data.birthDate !== undefined
          ? { birthDate: new Date(data.birthDate) }
          : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.extraPhone !== undefined
          ? { extraPhone: data.extraPhone }
          : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
      },
    });
  }

  async findByPhone(phone: string) {
    return await prisma.company.findUnique({ where: { phone } });
  }

  async findByName(name: string) {
    return await prisma.company.findUnique({ where: { name } });
  }

  async findById(id: number | string) {
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return null;
    }

    return await prisma.company.findUnique({ where: { id: parsedId } });
  }

  async findAll() {
    return await prisma.company.findMany({
      orderBy: { id: "asc" },
    });
  }
}
