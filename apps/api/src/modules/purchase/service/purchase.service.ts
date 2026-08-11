import { CompanyRepository } from "../../company/repository/company.repository";
import { BranchRepository } from "../../branch/repository/branch.repository";
import { ProductRepository } from "../../product/repository/product.repository";
import { SupplierRepository } from "../../supplier/repository/supplier.repository";
import { PaginationOptions } from "../../../core/utils/pagination";
import {
  PurchaseVoucherCreateDto,
  PurchaseVoucherUpdateDto,
} from "../dto/purchase.dto";
import { PurchaseRepository, isConfirmedStatus } from "../repository/purchase.repository";
import { PurchaseServiceResult } from "../types/purchase.types";

const purchaseRepository = new PurchaseRepository();
const companyRepository = new CompanyRepository();
const branchRepository = new BranchRepository();
const supplierRepository = new SupplierRepository();
const productRepository = new ProductRepository();

export class PurchaseService {
  private normalizeType(type: string) {
    return type === "iade" ? "iade" : "alis";
  }

  async getModalData(
    companyId: number,
    filters: {
      productPage: number;
      productLimit: number;
      productSearch?: string;
      productCategory?: string;
      supplierPage: number;
      supplierLimit: number;
      supplierSearch?: string;
      supplierCategory?: string;
    },
  ): Promise<PurchaseServiceResult> {
    try {
      if (Number.isNaN(companyId)) {
        return { status: "ERROR", error: "Gecersiz companyId" };
      }

      const company = await companyRepository.findById(companyId);
      if (!company) {
        return { status: "ERROR", error: "Sirket bulunamadi" };
      }

      const [
        supplierPageData,
        productPageData,
        warehouses,
        productCategories,
        supplierCategories,
      ] = await Promise.all([
        supplierRepository.findPurchaseModalPageByCompany(
          companyId,
          filters.supplierPage,
          filters.supplierLimit,
          filters.supplierSearch,
          filters.supplierCategory,
        ),
        productRepository.findPurchaseModalPageByCompany(
          companyId,
          filters.productPage,
          filters.productLimit,
          filters.productSearch,
          filters.productCategory,
        ),
        branchRepository.findWarehousesByCompany(companyId),
        productRepository.findPurchaseModalCategoryCounts(companyId),
        supplierRepository.findPurchaseModalCategoryCounts(companyId),
      ]);

      const flattenedWarehouses = warehouses.flatMap((warehouse) =>
        warehouse.branches.map((link) => ({
          id: warehouse.id,
          name: warehouse.name,
          companyId: warehouse.companyId,
          branchId: link.branch.id,
          branch: {
            id: link.branch.id,
            name: link.branch.name,
          },
        })),
      );

      return {
        status: "SUCCESS",
        modalData: {
          suppliers: {
            data: supplierPageData.suppliers,
            total: supplierPageData.total,
            page: filters.supplierPage,
            limit: filters.supplierLimit,
            totalPages: Math.max(
              1,
              Math.ceil(supplierPageData.total / filters.supplierLimit),
            ),
          },
          products: {
            data: productPageData.products,
            total: productPageData.total,
            page: filters.productPage,
            limit: filters.productLimit,
            totalPages: Math.max(
              1,
              Math.ceil(productPageData.total / filters.productLimit),
            ),
          },
          productCategories,
          supplierCategories,
          warehouses: flattenedWarehouses,
        },
      };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async findAllByCompany(companyId: number): Promise<PurchaseServiceResult> {
    try {
      if (Number.isNaN(companyId)) {
        return { status: "ERROR", error: "Gecersiz companyId" };
      }

      const company = await companyRepository.findById(companyId);
      if (!company) {
        return { status: "ERROR", error: "Sirket bulunamadi" };
      }

      const vouchers = await purchaseRepository.findAllByCompany(companyId);
      return { status: "SUCCESS", vouchers };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async findPaginatedByCompany(
    companyId: number,
    options: PaginationOptions,
    search?: string,
    type?: string,
  ): Promise<PurchaseServiceResult> {
    try {
      if (Number.isNaN(companyId)) {
        return { status: "ERROR", error: "Gecersiz companyId" };
      }

      const company = await companyRepository.findById(companyId);
      if (!company) {
        return { status: "ERROR", error: "Sirket bulunamadi" };
      }

      const { page, limit } = options;
      const { total, data, page: currentPage, limit: currentLimit, totalPages } =
        await purchaseRepository.findPaginatedByCompany(
          companyId,
          page,
          limit,
          search,
          type,
        );

      return {
        status: "SUCCESS",
        paginatedVouchers: {
          data,
          total,
          page: currentPage,
          limit: currentLimit,
          totalPages,
        },
      };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  private async validatePayload(
    data: PurchaseVoucherCreateDto | PurchaseVoucherUpdateDto,
    options?: { requireSerialNo?: boolean },
  ) {
    const serialNo = data.serialNo?.trim();
    const branchName = data.branchName?.trim();
    const warehouseName = data.warehouseName?.trim();
    const note = data.note?.trim() || null;
    const status = data.status?.trim() || "Taslak";
    const type = this.normalizeType(data.type);

    const companyId = Number(data.companyId);
    const supplierId = Number(data.supplierId);

    if (
      (options?.requireSerialNo ?? true)
        ? !serialNo || !branchName || !warehouseName
        : !branchName || !warehouseName
    ) {
      return { error: "Sened no, filial ve anbar zorunludur" };
    }

    if (Number.isNaN(companyId) || Number.isNaN(supplierId)) {
      return { error: "companyId ve supplierId zorunludur" };
    }

    const voucherDate = new Date(data.voucherDate);
    if (Number.isNaN(voucherDate.getTime())) {
      return { error: "Gecersiz sened tarihi" };
    }

    if (!Array.isArray(data.lines)) {
      return { error: "Satir listesi gecersiz" };
    }

    const company = await companyRepository.findById(companyId);
    if (!company) {
      return { error: "Sirket bulunamadi" };
    }

    const supplier = await supplierRepository.findByIdAndCompany(
      supplierId,
      companyId,
    );
    if (!supplier) {
      return { error: "Tedarikci bulunamadi" };
    }

    const warehouse = await purchaseRepository.findWarehouseByBranchAndName(
      companyId,
      branchName,
      warehouseName,
    );
    if (!warehouse) {
      return { error: "Filial/depo eslesmesi bulunamadi" };
    }

    const normalizedLines: Array<{
      productId: number;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }> = [];

    for (const line of data.lines) {
      const productId = Number(line.productId);
      const quantity = Number(line.quantity);
      const unitPrice = Number(line.unitPrice);

      if (
        Number.isNaN(productId) ||
        Number.isNaN(quantity) ||
        Number.isNaN(unitPrice)
      ) {
        return { error: "Satir bilgileri gecersiz" };
      }

      if (quantity <= 0 || unitPrice < 0) {
        return { error: "Miktar 0'dan buyuk ve birim fiyat negatif olmamali" };
      }

      const product = await productRepository.findByIdAndCompany(
        productId,
        companyId,
      );
      if (!product) {
        return { error: `Urun bulunamadi (ID: ${productId})` };
      }

      normalizedLines.push({
        productId,
        quantity,
        unitPrice,
        lineTotal: quantity * unitPrice,
      });
    }

    const totalAmount = normalizedLines.reduce(
      (sum, line) => sum + line.lineTotal,
      0,
    );

    return {
      payload: {
        serialNo: serialNo || "AUTO",
        type,
        branchName,
        warehouseName,
        supplierId,
        companyId,
        voucherDate,
        note,
        status,
        totalAmount,
        lines: normalizedLines,
      },
      warehouse,
    };
  }

  async create(data: PurchaseVoucherCreateDto): Promise<PurchaseServiceResult> {
    try {
      const validated = await this.validatePayload(
        { ...data, status: "Taslak" },
        {
          requireSerialNo: false,
        },
      );
      if ("error" in validated) {
        return { status: "ERROR", error: validated.error };
      }

      const generatedSerialNo = await purchaseRepository.getNextSerialNo(
        validated.payload.companyId,
        validated.payload.type,
      );

      const voucher = await purchaseRepository.create(
        {
          ...validated.payload,
          serialNo: generatedSerialNo,
          status: "Taslak",
        },
        validated.warehouse.id,
      );
      return { status: "SUCCESS", voucher };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async update(
    id: number,
    data: PurchaseVoucherUpdateDto,
  ): Promise<PurchaseServiceResult> {
    try {
      if (Number.isNaN(id)) {
        return { status: "ERROR", error: "Gecersiz sened ID" };
      }

      const companyId = Number(data.companyId);
      if (Number.isNaN(companyId)) {
        return { status: "ERROR", error: "Gecersiz companyId" };
      }

      const existing = await purchaseRepository.findByIdAndCompany(
        id,
        companyId,
      );
      if (!existing) {
        return { status: "ERROR", error: "Sened bulunamadi" };
      }

      if (isConfirmedStatus(existing.status)) {
        return {
          status: "ERROR",
          error:
            "Tesdiqli senedi duzenlemek ucun once tesdiqi legv edin",
        };
      }

      const validated = await this.validatePayload(
        { ...data, status: "Taslak" },
        {
          requireSerialNo: true,
        },
      );
      if ("error" in validated) {
        return { status: "ERROR", error: validated.error };
      }

      const previousWarehouse =
        await purchaseRepository.findWarehouseByBranchAndName(
          companyId,
          existing.branchName,
          existing.warehouseName,
        );
      if (!previousWarehouse) {
        return { status: "ERROR", error: "Mevcut senedin deposu bulunamadi" };
      }

      const voucher = await purchaseRepository.update(
        id,
        companyId,
        {
          ...validated.payload,
          status: "Taslak",
        },
        {
          warehouseId: previousWarehouse.id,
          type: existing.type,
          supplierId: existing.supplierId,
          totalAmount: existing.totalAmount,
          status: existing.status,
          lines: existing.lines.map(
            (line: { productId: number; quantity: number }) => ({
              productId: line.productId,
              quantity: line.quantity,
            }),
          ),
        },
        validated.warehouse.id,
      );
      return { status: "SUCCESS", voucher };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async confirm(
    id: number,
    companyId: number,
  ): Promise<PurchaseServiceResult> {
    try {
      if (Number.isNaN(id) || Number.isNaN(companyId)) {
        return { status: "ERROR", error: "Gecersiz sened bilgisi" };
      }

      const voucher = await purchaseRepository.setConfirmation(
        id,
        companyId,
        true,
      );
      return { status: "SUCCESS", voucher };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async unconfirm(
    id: number,
    companyId: number,
  ): Promise<PurchaseServiceResult> {
    try {
      if (Number.isNaN(id) || Number.isNaN(companyId)) {
        return { status: "ERROR", error: "Gecersiz sened bilgisi" };
      }

      const voucher = await purchaseRepository.setConfirmation(
        id,
        companyId,
        false,
      );
      return { status: "SUCCESS", voucher };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async delete(id: number, companyId: number): Promise<PurchaseServiceResult> {
    try {
      if (Number.isNaN(id) || Number.isNaN(companyId)) {
        return { status: "ERROR", error: "Gecersiz sened bilgisi" };
      }

      const existing = await purchaseRepository.findByIdAndCompany(
        id,
        companyId,
      );
      if (!existing) {
        return { status: "ERROR", error: "Sened bulunamadi" };
      }

      if (isConfirmedStatus(existing.status)) {
        return {
          status: "ERROR",
          error:
            "Tesdiqli sened siline bilmez. Evvelce tesdiqi legv edin",
        };
      }

      await purchaseRepository.delete(id, companyId);
      return { status: "SUCCESS" };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }
}
