import { Prisma } from "@elmry/database";

import { CategoryRepository } from "../repository/category.repository";
import { CategoryCreateDto, CategoryUpdateDto } from "../dto/category.dto";
import { CompanyRepository } from "../../company/repository/company.repository";
import { CategoryStatus } from "../enums/category.enums";
import { CategoryServiceResult } from "../types/category.types";

const categoryRepository = new CategoryRepository();
const companyRepository = new CompanyRepository();

export class CategoryService {
  async create(data: CategoryCreateDto): Promise<CategoryServiceResult> {
    try {
      const name = data.name?.trim();
      const companyId = Number(data.companyId);
      const parentId =
        data.parentId === undefined || data.parentId === null
          ? null
          : Number(data.parentId);

      if (!name || Number.isNaN(companyId)) {
        return {
          status: CategoryStatus.ERROR,
          error: "Kategori adi ve companyId zorunludur",
        };
      }

      if (parentId !== null && Number.isNaN(parentId)) {
        return {
          status: CategoryStatus.ERROR,
          error: "Geçersiz parentId",
        };
      }

      const company = await companyRepository.findById(companyId);
      if (!company) {
        return { status: CategoryStatus.ERROR, error: "Sirket bulunamadi" };
      }

      if (parentId !== null) {
        const parentCategory = await categoryRepository.findByIdAndCompany(
          parentId,
          companyId,
        );
        if (!parentCategory) {
          return {
            status: CategoryStatus.ERROR,
            error: "Ust kategori bulunamadi",
          };
        }
      }

      const existing = await categoryRepository.findByNameAndParent(
        name,
        companyId,
        parentId,
      );
      if (existing) {
        return {
          status: CategoryStatus.ERROR,
          error: "Bu isimde kategori bu seviyede zaten mevcut",
        };
      }

      const nextCompanyCategoryId =
        await categoryRepository.getNextCompanyCategoryId(companyId);

      const category = await categoryRepository.create(
        name,
        companyId,
        nextCompanyCategoryId,
        parentId,
      );
      return { status: CategoryStatus.SUCCESS, category };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return {
          status: CategoryStatus.ERROR,
          error: "Bu kategori zaten mevcut",
        };
      }
      return { status: CategoryStatus.ERROR, error: (error as Error).message };
    }
  }

  async findAllByCompany(companyId: number): Promise<CategoryServiceResult> {
    try {
      if (Number.isNaN(companyId)) {
        return { status: CategoryStatus.ERROR, error: "Geçersiz companyId" };
      }

      const company = await companyRepository.findById(companyId);
      if (!company) {
        return { status: CategoryStatus.ERROR, error: "Sirket bulunamadi" };
      }

      const categories = await categoryRepository.findAllByCompany(companyId);
      return { status: CategoryStatus.SUCCESS, categories };
    } catch (error) {
      return { status: CategoryStatus.ERROR, error: (error as Error).message };
    }
  }

  async findParentsByCompany(
    companyId: number,
  ): Promise<CategoryServiceResult> {
    try {
      if (Number.isNaN(companyId)) {
        return { status: CategoryStatus.ERROR, error: "Geçersiz companyId" };
      }

      const company = await companyRepository.findById(companyId);
      if (!company) {
        return { status: CategoryStatus.ERROR, error: "Sirket bulunamadi" };
      }

      const categories =
        await categoryRepository.findParentsByCompany(companyId);
      return { status: CategoryStatus.SUCCESS, categories };
    } catch (error) {
      return { status: CategoryStatus.ERROR, error: (error as Error).message };
    }
  }

  async findChildrenByParent(
    companyId: number,
    parentId: number,
  ): Promise<CategoryServiceResult> {
    try {
      if (Number.isNaN(companyId) || Number.isNaN(parentId)) {
        return { status: CategoryStatus.ERROR, error: "Geçersiz parametre" };
      }

      const company = await companyRepository.findById(companyId);
      if (!company) {
        return { status: CategoryStatus.ERROR, error: "Sirket bulunamadi" };
      }

      const parentCategory = await categoryRepository.findByIdAndCompany(
        parentId,
        companyId,
      );
      if (!parentCategory) {
        return {
          status: CategoryStatus.ERROR,
          error: "Ust kategori bulunamadi",
        };
      }

      const categories = await categoryRepository.findChildrenByParent(
        companyId,
        parentId,
      );
      return { status: CategoryStatus.SUCCESS, categories };
    } catch (error) {
      return { status: CategoryStatus.ERROR, error: (error as Error).message };
    }
  }

  async update(
    id: number,
    data: CategoryUpdateDto,
  ): Promise<CategoryServiceResult> {
    try {
      const name = data.name?.trim();
      const companyId = Number(data.companyId);
      const parentId =
        data.parentId === undefined || data.parentId === null
          ? null
          : Number(data.parentId);

      if (!name || Number.isNaN(companyId)) {
        return {
          status: CategoryStatus.ERROR,
          error: "Kategori adi ve companyId zorunludur",
        };
      }

      if (parentId !== null && Number.isNaN(parentId)) {
        return {
          status: CategoryStatus.ERROR,
          error: "Geçersiz parentId",
        };
      }

      if (parentId !== null && parentId === id) {
        return {
          status: CategoryStatus.ERROR,
          error: "Kategori kendi ustu olamaz",
        };
      }

      const existingCategory = await categoryRepository.findByIdAndCompany(
        id,
        companyId,
      );
      if (!existingCategory) {
        return { status: CategoryStatus.ERROR, error: "Kategori bulunamadi" };
      }

      if (parentId !== null) {
        const parentCategory = await categoryRepository.findByIdAndCompany(
          parentId,
          companyId,
        );
        if (!parentCategory) {
          return {
            status: CategoryStatus.ERROR,
            error: "Ust kategori bulunamadi",
          };
        }
      }

      const existingByName = await categoryRepository.findByNameAndParent(
        name,
        companyId,
        parentId,
      );
      if (existingByName && existingByName.id !== id) {
        return {
          status: CategoryStatus.ERROR,
          error: "Bu isimde kategori bu seviyede zaten mevcut",
        };
      }

      const category = await categoryRepository.update(
        id,
        companyId,
        name,
        parentId,
      );
      return { status: CategoryStatus.SUCCESS, category };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return {
          status: CategoryStatus.ERROR,
          error: "Bu kategori zaten mevcut",
        };
      }
      return { status: CategoryStatus.ERROR, error: (error as Error).message };
    }
  }

  async delete(id: number, companyId: number): Promise<CategoryServiceResult> {
    try {
      if (Number.isNaN(companyId)) {
        return { status: CategoryStatus.ERROR, error: "Geçersiz companyId" };
      }

      const existingCategory = await categoryRepository.findByIdAndCompany(
        id,
        companyId,
      );
      if (!existingCategory) {
        return { status: CategoryStatus.ERROR, error: "Kategori bulunamadi" };
      }

      const hasChildren = await categoryRepository.hasChildren(id, companyId);
      if (hasChildren) {
        return {
          status: CategoryStatus.ERROR,
          error: "Alt kategorileri olan kategori silinemez",
        };
      }

      const hasProducts = await categoryRepository.hasProducts(id, companyId);
      if (hasProducts) {
        return {
          status: CategoryStatus.ERROR,
          error: "Ürünlere bagli kategori silinemez",
        };
      }

      await categoryRepository.delete(id, companyId);
      return { status: CategoryStatus.SUCCESS };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2003"
      ) {
        return {
          status: CategoryStatus.ERROR,
          error: "Kategori iliskili kayitlar nedeniyle silinemedi",
        };
      }

      return { status: CategoryStatus.ERROR, error: (error as Error).message };
    }
  }
}
