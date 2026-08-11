import { prisma } from "@elmry/database";


export class CategoryRepository {
  async create(
    name: string,
    companyId: number,
    companyCategoryId: number,
    parentId?: number | null,
  ) {
    return await prisma.category.create({
      data: {
        name,
        companyId,
        companyCategoryId,
        parentId: parentId ?? null,
      },
    });
  }

  async getNextCompanyCategoryId(companyId: number) {
    const lastCategory = await prisma.category.findFirst({
      where: { companyId },
      orderBy: { companyCategoryId: "desc" },
      select: { companyCategoryId: true },
    });

    const lastId = lastCategory?.companyCategoryId || 0;
    return lastId + 1;
  }

  async findAllByCompany(companyId: number) {
    return await prisma.category.findMany({
      where: { companyId },
      orderBy: { companyCategoryId: "asc" },
    });
  }

  async findParentsByCompany(companyId: number) {
    return await prisma.category.findMany({
      where: { companyId, parentId: null },
      orderBy: { companyCategoryId: "asc" },
    });
  }

  async findChildrenByParent(companyId: number, parentId: number) {
    return await prisma.category.findMany({
      where: { companyId, parentId },
      orderBy: { companyCategoryId: "asc" },
    });
  }

  async findByIdAndCompany(id: number, companyId: number) {
    return await prisma.category.findFirst({
      where: { id, companyId },
    });
  }

  async findByNameInCompany(name: string, companyId: number) {
    return await prisma.category.findFirst({
      where: { name, companyId },
    });
  }

  async findByNameAndParent(
    name: string,
    companyId: number,
    parentId: number | null,
  ) {
    return await prisma.category.findFirst({
      where: { name, companyId, parentId },
    });
  }

  async update(
    id: number,
    companyId: number,
    name: string,
    parentId?: number | null,
  ) {
    await prisma.category.updateMany({
      where: { id, companyId },
      data: { name, parentId: parentId ?? null },
    });

    return await this.findByIdAndCompany(id, companyId);
  }

  async delete(id: number, companyId: number) {
    return await prisma.category.deleteMany({
      where: { id, companyId },
    });
  }

  async hasChildren(id: number, companyId: number) {
    const count = await prisma.category.count({
      where: { companyId, parentId: id },
    });

    return count > 0;
  }

  async hasProducts(id: number, companyId: number) {
    const count = await prisma.product.count({
      where: {
        companyId,
        OR: [{ parentCategoryId: id }, { subCategoryId: id }],
      },
    });

    return count > 0;
  }
}
