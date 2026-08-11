import { Prisma } from "@elmry/database";
import { ProductRepository, mapProductBranchStocks } from "../repository/product.repository";
import { ProductCreateDto, ProductUpdateDto } from "../dto/product.dto";
import { CompanyRepository } from "../../company/repository/company.repository";
import { CategoryRepository } from "../../category/repository/category.repository";
import { ProductStatus } from "../enums/product.enums";
import { ProductServiceResult } from "../types/product.types";


const productRepository = new ProductRepository();
const companyRepository = new CompanyRepository();
const categoryRepository = new CategoryRepository();

export class ProductService {
  private async isDescendantOfParent(
    childCategoryId: number,
    parentCategoryId: number,
    companyId: number,
  ): Promise<boolean> {
    let current = await categoryRepository.findByIdAndCompany(
      childCategoryId,
      companyId,
    );
    const visited = new Set<number>();

    while (current) {
      if (visited.has(current.id)) {
        return false;
      }

      visited.add(current.id);

      if (current.parentId === parentCategoryId) {
        return true;
      }

      if (current.parentId === null) {
        return false;
      }

      current = await categoryRepository.findByIdAndCompany(
        current.parentId,
        companyId,
      );
    }

    return false;
  }

  async create(data: ProductCreateDto): Promise<ProductServiceResult> {
    try {
      const name = data.name?.trim();
      const barcode = data.barcode?.trim();
      const companyId = Number(data.companyId);
      const parentCategoryId = Number(data.parentCategoryId);
      const subCategoryId =
        data.subCategoryId === undefined || data.subCategoryId === null
          ? null
          : Number(data.subCategoryId);
      const stockQuantityRaw =
        data.stockQuantity === undefined || data.stockQuantity === null
          ? null
          : Number(data.stockQuantity);
      const branchStockQuantityRaw =
        data.branchStockQuantity === undefined ||
        data.branchStockQuantity === null
          ? null
          : Number(data.branchStockQuantity);
      const companyStockQuantityRaw =
        data.companyStockQuantity === undefined ||
        data.companyStockQuantity === null
          ? null
          : Number(data.companyStockQuantity);
      const stockUnitRaw = data.stockUnit?.trim() || null;
      const salePrice = Number(data.salePrice);
      const purchasePrice =
        data.purchasePrice === undefined || data.purchasePrice === null
          ? null
          : Number(data.purchasePrice);
      const imageUrl = data.imageUrl?.trim() || null;
      const isActive = data.isActive ?? true;
      const description = data.description?.trim() || null;

      if (!name || !barcode || Number.isNaN(companyId)) {
        return {
          status: ProductStatus.ERROR,
          error: "Urun adi, barkod ve companyId zorunludur",
        };
      }

      if (Number.isNaN(parentCategoryId) || Number.isNaN(salePrice)) {
        return {
          status: ProductStatus.ERROR,
          error: "Ana kategori ve satis fiyati zorunludur",
        };
      }

      if (purchasePrice !== null && Number.isNaN(purchasePrice)) {
        return {
          status: ProductStatus.ERROR,
          error: "Alis fiyati sayisal olmali",
        };
      }

      if (subCategoryId !== null && Number.isNaN(subCategoryId)) {
        return {
          status: ProductStatus.ERROR,
          error: "Gecersiz alt kategori",
        };
      }

      const stockQuantity = stockQuantityRaw ?? 0;
      const branchStockQuantity = branchStockQuantityRaw ?? stockQuantity;
      const companyStockQuantity = companyStockQuantityRaw ?? stockQuantity;
      const stockUnit = stockUnitRaw ?? "adet";

      if (Number.isNaN(stockQuantity) || stockQuantity < 0) {
        return {
          status: ProductStatus.ERROR,
          error: "Stok miktari sayisal olmali",
        };
      }

      if (Number.isNaN(branchStockQuantity) || branchStockQuantity < 0) {
        return {
          status: ProductStatus.ERROR,
          error: "Filial stok miktari sayisal olmali",
        };
      }

      if (Number.isNaN(companyStockQuantity) || companyStockQuantity < 0) {
        return {
          status: ProductStatus.ERROR,
          error: "Sirket stok miktari sayisal olmali",
        };
      }

      if (!this.isValidStockUnit(stockUnit)) {
        return {
          status: ProductStatus.ERROR,
          error: "Stok birimi gecersiz",
        };
      }

      const company = await companyRepository.findById(companyId);
      if (!company) {
        return { status: ProductStatus.ERROR, error: "Sirket bulunamadi" };
      }

      const parentCategory = await categoryRepository.findByIdAndCompany(
        parentCategoryId,
        companyId,
      );
      if (!parentCategory) {
        return {
          status: ProductStatus.ERROR,
          error: "Ana kategori bulunamadi",
        };
      }

      if (parentCategory.parentId !== null) {
        return {
          status: ProductStatus.ERROR,
          error: "Ana kategori ust kategori olmali",
        };
      }

      if (subCategoryId !== null) {
        if (subCategoryId === parentCategoryId) {
          return {
            status: ProductStatus.ERROR,
            error: "Alt kategori ana kategoriyle ayni olamaz",
          };
        }

        const subCategory = await categoryRepository.findByIdAndCompany(
          subCategoryId,
          companyId,
        );
        if (!subCategory) {
          return {
            status: ProductStatus.ERROR,
            error: "Alt kategori bulunamadi",
          };
        }

        const isDescendant = await this.isDescendantOfParent(
          subCategoryId,
          parentCategoryId,
          companyId,
        );
        if (!isDescendant) {
          return {
            status: ProductStatus.ERROR,
            error: "Secilen kategori ana kategoriyle uyusmuyor",
          };
        }
      }

      const product = await productRepository.create({
        name,
        barcode,
        stockQuantity,
        branchStockQuantity,
        companyStockQuantity,
        stockUnit,
        description,
        salePrice,
        purchasePrice,
        imageUrl,
        isActive,
        companyId,
        parentCategoryId,
        subCategoryId,
      });

      return {
        status: ProductStatus.SUCCESS,
        product: mapProductBranchStocks(product),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return {
          status: ProductStatus.ERROR,
          error: "Bu barkod zaten kullaniliyor",
        };
      }
      return { status: ProductStatus.ERROR, error: (error as Error).message };
    }
  }

  async findAllByCompany(companyId: number): Promise<ProductServiceResult> {
    try {
      if (Number.isNaN(companyId)) {
        return { status: ProductStatus.ERROR, error: "Gecersiz companyId" };
      }

      const company = await companyRepository.findById(companyId);
      if (!company) {
        return { status: ProductStatus.ERROR, error: "Sirket bulunamadi" };
      }

      const products = await productRepository.findAllByCompany(companyId);
      return {
        status: ProductStatus.SUCCESS,
        products: products.map(mapProductBranchStocks),
      };
    } catch (error) {
      return { status: ProductStatus.ERROR, error: (error as Error).message };
    }
  }

  async searchByCompany(
    companyId: number,
    filters: { id?: number; name?: string; barcode?: string },
  ): Promise<ProductServiceResult> {
    try {
      if (Number.isNaN(companyId)) {
        return { status: ProductStatus.ERROR, error: "Gecersiz companyId" };
      }

      const company = await companyRepository.findById(companyId);
      if (!company) {
        return { status: ProductStatus.ERROR, error: "Sirket bulunamadi" };
      }

      const products = await productRepository.searchByCompany(
        companyId,
        filters,
      );

      return {
        status: ProductStatus.SUCCESS,
        products: products.map(mapProductBranchStocks),
      };
    } catch (error) {
      return { status: ProductStatus.ERROR, error: (error as Error).message };
    }
  }

  async update(
    id: number,
    data: ProductUpdateDto,
  ): Promise<ProductServiceResult> {
    try {
      const name = data.name?.trim();
      const barcode = data.barcode?.trim();
      const companyId = Number(data.companyId);
      const parentCategoryId = Number(data.parentCategoryId);
      const subCategoryId =
        data.subCategoryId === undefined || data.subCategoryId === null
          ? null
          : Number(data.subCategoryId);
      const stockQuantityRaw =
        data.stockQuantity === undefined || data.stockQuantity === null
          ? null
          : Number(data.stockQuantity);
      const branchStockQuantityRaw =
        data.branchStockQuantity === undefined ||
        data.branchStockQuantity === null
          ? null
          : Number(data.branchStockQuantity);
      const companyStockQuantityRaw =
        data.companyStockQuantity === undefined ||
        data.companyStockQuantity === null
          ? null
          : Number(data.companyStockQuantity);
      const stockUnitRaw = data.stockUnit?.trim() || null;
      const salePrice = Number(data.salePrice);
      const purchasePrice =
        data.purchasePrice === undefined || data.purchasePrice === null
          ? null
          : Number(data.purchasePrice);
      const imageUrl = data.imageUrl?.trim() || null;
      const isActive = data.isActive ?? true;
      const description = data.description?.trim() || null;

      if (!name || !barcode || Number.isNaN(companyId)) {
        return {
          status: ProductStatus.ERROR,
          error: "Urun adi, barkod ve companyId zorunludur",
        };
      }

      if (Number.isNaN(parentCategoryId) || Number.isNaN(salePrice)) {
        return {
          status: ProductStatus.ERROR,
          error: "Ana kategori ve satis fiyati zorunludur",
        };
      }

      if (purchasePrice !== null && Number.isNaN(purchasePrice)) {
        return {
          status: ProductStatus.ERROR,
          error: "Alis fiyati sayisal olmali",
        };
      }

      if (subCategoryId !== null && Number.isNaN(subCategoryId)) {
        return {
          status: ProductStatus.ERROR,
          error: "Gecersiz alt kategori",
        };
      }

      const existing = await productRepository.findByIdAndCompany(
        id,
        companyId,
      );
      if (!existing) {
        return { status: ProductStatus.ERROR, error: "Urun bulunamadi" };
      }

      const stockQuantity =
        stockQuantityRaw === null ? existing.stockQuantity : stockQuantityRaw;
      const existingBranchStock =
        (existing as { branchStockQuantity?: number }).branchStockQuantity ??
        existing.stockQuantity;
      const existingCompanyStock =
        (existing as { companyStockQuantity?: number }).companyStockQuantity ??
        existing.stockQuantity;

      const branchStockQuantity =
        branchStockQuantityRaw === null
          ? existingBranchStock
          : branchStockQuantityRaw;
      const companyStockQuantity =
        companyStockQuantityRaw === null
          ? existingCompanyStock
          : companyStockQuantityRaw;
      const stockUnit = stockUnitRaw ?? existing.stockUnit ?? "adet";

      if (Number.isNaN(stockQuantity) || stockQuantity < 0) {
        return {
          status: ProductStatus.ERROR,
          error: "Stok miktari sayisal olmali",
        };
      }

      if (Number.isNaN(branchStockQuantity) || branchStockQuantity < 0) {
        return {
          status: ProductStatus.ERROR,
          error: "Filial stok miktari sayisal olmali",
        };
      }

      if (Number.isNaN(companyStockQuantity) || companyStockQuantity < 0) {
        return {
          status: ProductStatus.ERROR,
          error: "Sirket stok miktari sayisal olmali",
        };
      }

      if (!this.isValidStockUnit(stockUnit)) {
        return {
          status: ProductStatus.ERROR,
          error: "Stok birimi gecersiz",
        };
      }

      const company = await companyRepository.findById(companyId);
      if (!company) {
        return { status: ProductStatus.ERROR, error: "Sirket bulunamadi" };
      }

      const parentCategory = await categoryRepository.findByIdAndCompany(
        parentCategoryId,
        companyId,
      );
      if (!parentCategory) {
        return {
          status: ProductStatus.ERROR,
          error: "Ana kategori bulunamadi",
        };
      }

      if (parentCategory.parentId !== null) {
        return {
          status: ProductStatus.ERROR,
          error: "Ana kategori ust kategori olmali",
        };
      }

      if (subCategoryId !== null) {
        if (subCategoryId === parentCategoryId) {
          return {
            status: ProductStatus.ERROR,
            error: "Alt kategori ana kategoriyle ayni olamaz",
          };
        }

        const subCategory = await categoryRepository.findByIdAndCompany(
          subCategoryId,
          companyId,
        );
        if (!subCategory) {
          return {
            status: ProductStatus.ERROR,
            error: "Alt kategori bulunamadi",
          };
        }

        const isDescendant = await this.isDescendantOfParent(
          subCategoryId,
          parentCategoryId,
          companyId,
        );
        if (!isDescendant) {
          return {
            status: ProductStatus.ERROR,
            error: "Secilen kategori ana kategoriyle uyusmuyor",
          };
        }
      }

      const product = await productRepository.update(id, companyId, {
        name,
        barcode,
        stockQuantity,
        branchStockQuantity,
        companyStockQuantity,
        stockUnit,
        description,
        salePrice,
        purchasePrice,
        imageUrl,
        isActive,
        parentCategoryId,
        subCategoryId,
      });

      if (!product) {
        return { status: ProductStatus.ERROR, error: "Urun bulunamadi" };
      }

      return {
        status: ProductStatus.SUCCESS,
        product: mapProductBranchStocks(product),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return {
          status: ProductStatus.ERROR,
          error: "Bu barkod zaten kullaniliyor",
        };
      }
      return { status: ProductStatus.ERROR, error: (error as Error).message };
    }
  }

  async delete(id: number, companyId: number): Promise<ProductServiceResult> {
    try {
      if (Number.isNaN(companyId)) {
        return { status: ProductStatus.ERROR, error: "Gecersiz companyId" };
      }

      const existing = await productRepository.findByIdAndCompany(
        id,
        companyId,
      );
      if (!existing) {
        return { status: ProductStatus.ERROR, error: "Urun bulunamadi" };
      }

      await productRepository.delete(id, companyId);
      return { status: ProductStatus.SUCCESS };
    } catch (error) {
      return { status: ProductStatus.ERROR, error: (error as Error).message };
    }
  }

  private isValidStockUnit(value: string) {
    const normalized = value.toLowerCase();
    return (
      normalized === "adet" || normalized === "kg" || normalized === "litre"
    );
  }

  async generateUniqueBarcode(companyId: number): Promise<string> {
    let barcode = "";
    let exists: boolean;
    do {
      barcode = Array.from({ length: 13 }, () =>
        Math.floor(Math.random() * 10),
      ).join("");
      exists = !!(await productRepository.findByBarcodeAndCompany(
        barcode,
        companyId,
      ));
    } while (exists);
    return barcode;
  }
}
