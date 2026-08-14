import { prisma } from "@elmry/database";

export class CustomerRepository {
  async create(data: {
    name: string;
    contactPerson?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    taxNumber?: string | null;
    status: string;
    companyId: number;
  }) {
    return await prisma.customer.create({
      data: {
        name: data.name,
        contactPerson: data.contactPerson ?? null,
        phone: data.phone ?? null,
        email: data.email ?? null,
        address: data.address ?? null,
        taxNumber: data.taxNumber ?? null,
        status: data.status,
        companyId: data.companyId,
      },
    });
  }

  async findAllByCompany(companyId: number) {
    return await prisma.customer.findMany({
      where: { companyId },
      orderBy: { id: "desc" },
    });
  }

  async findByIdAndCompany(id: number, companyId: number) {
    return await prisma.customer.findFirst({
      where: { id, companyId },
    });
  }

  async update(
    id: number,
    companyId: number,
    data: {
      name?: string;
      contactPerson?: string | null;
      phone?: string | null;
      email?: string | null;
      address?: string | null;
      taxNumber?: string | null;
      status?: string;
    },
  ) {
    await prisma.customer.updateMany({
      where: { id, companyId },
      data,
    });
    return this.findByIdAndCompany(id, companyId);
  }

  async delete(id: number, companyId: number) {
    return await prisma.customer.deleteMany({
      where: { id, companyId },
    });
  }

  private async syncDebt(id: number, companyId: number) {
    const row = await this.findByIdAndCompany(id, companyId);
    if (!row) return null;
    const debt =
      Number(row.totalSales || 0) -
      Number(row.totalReturn || 0) -
      Number(row.totalPayment || 0);
    await prisma.customer.updateMany({
      where: { id, companyId },
      data: { debt },
    });
    return this.findByIdAndCompany(id, companyId);
  }

  /** Açıq hesab / satış (ödənişsiz) */
  async addSale(id: number, companyId: number, amount: number) {
    await prisma.customer.updateMany({
      where: { id, companyId },
      data: { totalSales: { increment: amount } },
    });
    return this.syncDebt(id, companyId);
  }

  /** Nağd/kart satış — həm satış, həm ödəniş */
  async addPaidSale(id: number, companyId: number, amount: number) {
    await prisma.customer.updateMany({
      where: { id, companyId },
      data: {
        totalSales: { increment: amount },
        totalPayment: { increment: amount },
      },
    });
    return this.syncDebt(id, companyId);
  }

  async addReturn(id: number, companyId: number, amount: number) {
    await prisma.customer.updateMany({
      where: { id, companyId },
      data: { totalReturn: { increment: amount } },
    });
    return this.syncDebt(id, companyId);
  }

  async addPayment(id: number, companyId: number, amount: number) {
    await prisma.customer.updateMany({
      where: { id, companyId },
      data: { totalPayment: { increment: amount } },
    });
    return this.syncDebt(id, companyId);
  }

  /** Geri uyğunluq: borc = açıq hesab satışı */
  async addDebt(id: number, companyId: number, amount: number) {
    return this.addSale(id, companyId, amount);
  }
}
