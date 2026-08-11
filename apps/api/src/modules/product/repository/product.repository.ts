import { prisma } from "@elmry/database";

const productListInclude = {
  parentCategory: true,
  subCategory: true,
  warehouseStocks: {
    select: {
      quantity: true,
      warehouse: {
        select: {
          id: true,
          name: true,
          branches: {
            select: {
              branch: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

export function mapProductBranchStocks<
  T extends {
    warehouseStocks?: Array<{
      quantity: number;
      warehouse: {
        id: number;
        name: string;
        branches: Array<{
          branch: { id: number; name: string };
        }>;
      };
    }>;
    branchStockQuantity?: number;
  },
>(product: T) {
  const totals = new Map<
    number,
    { branchId: number; branchName: string; quantity: number }
  >();

  for (const stock of product.warehouseStocks ?? []) {
    for (const link of stock.warehouse.branches) {
      const branchId = link.branch.id;
      const branchName = link.branch.name;
      const current = totals.get(branchId);
      if (current) {
        current.quantity += stock.quantity;
      } else {
        totals.set(branchId, {
          branchId,
          branchName,
          quantity: stock.quantity,
        });
      }
    }
  }

  const { warehouseStocks: _warehouseStocks, ...rest } = product;
  return {
    ...rest,
    branchStocks: Array.from(totals.values()),
  };
}

export class ProductRepository {
  async create(data: {
    name: string;
    barcode: string;
    stockQuantity: number;
    branchStockQuantity: number;
    companyStockQuantity: number;
    stockUnit: string;
    description?: string | null;
    salePrice: number;
    purchasePrice?: number | null;
    imageUrl?: string | null;
    isActive?: boolean;
    companyId: number;
    parentCategoryId: number;
    subCategoryId?: number | null;
  }) {
    return await prisma.product.create({
      data: {
        name: data.name,
        barcode: data.barcode,
        stockQuantity: data.stockQuantity,
        branchStockQuantity: data.branchStockQuantity,
        companyStockQuantity: data.companyStockQuantity,
        stockUnit: data.stockUnit,
        description: data.description ?? null,
        salePrice: data.salePrice,
        purchasePrice: data.purchasePrice ?? null,
        imageUrl: data.imageUrl ?? null,
        isActive: data.isActive ?? true,
        companyId: data.companyId,
        parentCategoryId: data.parentCategoryId,
        subCategoryId: data.subCategoryId ?? null,
      },
      include: productListInclude,
    });
  }

  async findAllByCompany(companyId: number) {
    return await prisma.product.findMany({
      where: { companyId },
      include: productListInclude,
      orderBy: { id: "desc" },
    });
  }

  async findPurchaseModalDataByCompany(companyId: number) {
    return await prisma.product.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        barcode: true,
        stockQuantity: true,
        companyStockQuantity: true,
        stockUnit: true,
        purchasePrice: true,
        parentCategory: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });
  }

  async findPurchaseModalPageByCompany(
    companyId: number,
    page: number,
    limit: number,
    search?: string,
    category?: string,
  ) {
    const normalizedSearch = search?.trim();
    const normalizedCategory = category?.trim();
    const where = {
      companyId,
      ...(normalizedCategory && normalizedCategory !== "Hamisi"
        ? {
            parentCategory: {
              name: {
                equals: normalizedCategory,
              },
            },
          }
        : {}),
      ...(normalizedSearch
        ? {
            OR: [
              { name: { contains: normalizedSearch } },
              { barcode: { contains: normalizedSearch } },
            ],
          }
        : {}),
    };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          barcode: true,
          stockQuantity: true,
          companyStockQuantity: true,
          stockUnit: true,
          purchasePrice: true,
          parentCategory: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { id: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { total, products };
  }

  async findPurchaseModalCategoryCounts(companyId: number) {
    const products = await prisma.product.findMany({
      where: { companyId },
      select: {
        parentCategory: {
          select: {
            name: true,
          },
        },
      },
    });

    const counts = new Map<string, number>();
    counts.set("Hamisi", products.length);

    for (const product of products) {
      const name = product.parentCategory?.name || "Diger";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    return Array.from(counts.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }

  async searchByCompany(
    companyId: number,
    filters: { id?: number; name?: string; barcode?: string },
  ) {
    return await prisma.product.findMany({
      where: {
        companyId,
        ...(filters.id !== undefined ? { id: filters.id } : {}),
        ...(filters.name
          ? {
              name: {
                contains: filters.name,
              },
            }
          : {}),
        ...(filters.barcode
          ? {
              barcode: {
                contains: filters.barcode,
              },
            }
          : {}),
      },
      include: productListInclude,
      orderBy: { id: "desc" },
    });
  }

  async findByIdAndCompany(id: number, companyId: number) {
    return await prisma.product.findFirst({
      where: { id, companyId },
      include: productListInclude,
    });
  }

  async update(
    id: number,
    companyId: number,
    data: {
      name: string;
      barcode: string;
      stockQuantity: number;
      branchStockQuantity: number;
      companyStockQuantity: number;
      stockUnit: string;
      description?: string | null;
      salePrice: number;
      purchasePrice?: number | null;
      imageUrl?: string | null;
      isActive?: boolean;
      parentCategoryId: number;
      subCategoryId?: number | null;
    },
  ) {
    await prisma.product.updateMany({
      where: { id, companyId },
      data: {
        name: data.name,
        barcode: data.barcode,
        stockQuantity: data.stockQuantity,
        branchStockQuantity: data.branchStockQuantity,
        companyStockQuantity: data.companyStockQuantity,
        stockUnit: data.stockUnit,
        description: data.description ?? null,
        salePrice: data.salePrice,
        purchasePrice: data.purchasePrice ?? null,
        imageUrl: data.imageUrl ?? null,
        isActive: data.isActive ?? true,
        parentCategoryId: data.parentCategoryId,
        subCategoryId: data.subCategoryId ?? null,
      },
    });

    return await this.findByIdAndCompany(id, companyId);
  }

  async delete(id: number, companyId: number) {
    return await prisma.product.deleteMany({
      where: { id, companyId },
    });
  }
  async findByBarcodeAndCompany(barcode: string, companyId: number) {
    return await prisma.product.findFirst({
      where: { barcode, companyId },
    });
  }
}
