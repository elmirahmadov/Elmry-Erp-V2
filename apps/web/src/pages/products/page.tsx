"use client";

import { useEffect } from "react";
import { useAppDispatch } from "../../common/store/hooks";
import { showDeleteModal } from "../../common/store/productModalSlice";
import { useAuth } from "../../common/contexts/AuthContext";
import Loading from "../../common/components/loading";
import { Pagination } from "../../common/components/pagination";
import {
  ProductCreateModal,
  ProductEditModal,
  ProductDeleteModal,
  ProductsTable,
  ProductsToolbar,
  ProductsFilterDrawer,
} from "./components";
import { ITEMS_PER_PAGE } from "./constants/product.constants";
import {
  formatPrice,
  formatStock,
  formatStockUnit,
} from "./lib/product.formatters";
import { useProductActions } from "./hooks/useProductActions";
import { useProductCategories } from "./hooks/useProductCategories";
import { useProductForm } from "./hooks/useProductForm";
import { useProductsData } from "./hooks/useProductsData";
import { useProductsFilters } from "./hooks/useProductsFilters";
import { useProductsPagination } from "./hooks/useProductsPagination";

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { user, branches } = useAuth();
  const companyId = user?.companyId;

  const { products, setProducts, loading, error, fetchProducts } =
    useProductsData(companyId);

  const {
    parentCategories,
    childrenByParent,
    getPath,
    getLevels,
    ensureCategoriesLoaded,
  } = useProductCategories(companyId);

  const {
    form,
    setForm,
    modalError,
    setModalError,
    isCreateOpen,
    setIsCreateOpen,
    isEditOpen,
    setIsEditOpen,
    activeProduct,
    setActiveProduct,
    level2Categories,
    level3Categories,
    level4Categories,
    openCreateModal,
    openEditModal,
    closeCreateModal,
    closeEditModal,
    handleChange,
    handleParentChange,
    handleLevel2Change,
    handleLevel3Change,
    handleLevel4Change,
  } = useProductForm({
    companyId,
    childrenByParent,
    getPath,
    ensureCategoriesLoaded,
  });

  const {
    smartSearchTerm,
    setSmartSearchTerm,
    draftFilters,
    updateDraftFilter,
    filteredProducts,
    activeFilterCount,
    isFilterOpen,
    openFilterDrawer,
    closeFilterDrawer,
    applyDetailFilters,
    clearDetailFilters,
  } = useProductsFilters(products);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedProducts,
  } = useProductsPagination(filteredProducts);

  useEffect(() => {
    setCurrentPage(1);
  }, [smartSearchTerm, setCurrentPage]);

  const {
    createLoading,
    editLoading,
    deleteLoading,
    handleCreateSubmit,
    handleEditSubmit,
  } = useProductActions({
    companyId,
    form,
    activeProduct,
    products,
    setProducts,
    setModalError,
    setForm,
    setIsCreateOpen,
    setIsEditOpen,
    setActiveProduct,
    currentPage,
    setCurrentPage,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  const handleOpenDeleteModal = () => {
    if (activeProduct) {
      dispatch(
        showDeleteModal({
          productId: activeProduct.id,
          productName: activeProduct.name,
        }),
      );
    }
  };

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "calc(100vh - var(--header-height))" }}
    >
      <div className="shrink-0">
        <ProductsToolbar
          smartSearchTerm={smartSearchTerm}
          setSmartSearchTerm={setSmartSearchTerm}
          onOpenFilters={() => {
            void ensureCategoriesLoaded();
            openFilterDrawer();
          }}
          onCreate={openCreateModal}
          activeFilterCount={activeFilterCount}
        />
        {error && (
          <p className="border-b border-border px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loading />
          </div>
        ) : (
          <ProductsTable
            products={paginatedProducts}
            branches={branches}
            onRowClick={openEditModal}
            getProductCategoryLevels={getLevels}
            formatPrice={formatPrice}
            formatStock={formatStock}
            formatStockUnit={formatStockUnit}
          />
        )}
      </div>

      <div className="shrink-0">
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalRows={filteredProducts.length}
          totalPages={totalPages}
        />
      </div>

      <ProductsFilterDrawer
        isOpen={isFilterOpen}
        filters={draftFilters}
        categories={parentCategories}
        onChange={updateDraftFilter}
        onClose={closeFilterDrawer}
        onApply={() => {
          applyDetailFilters();
          setCurrentPage(1);
        }}
        onClear={() => {
          clearDetailFilters();
          setCurrentPage(1);
        }}
      />

      <ProductCreateModal
        isOpen={isCreateOpen}
        form={form}
        level1Categories={parentCategories}
        level2Categories={level2Categories}
        level3Categories={level3Categories}
        level4Categories={level4Categories}
        onChange={handleChange}
        onLevel1Change={handleParentChange}
        onLevel2Change={handleLevel2Change}
        onLevel3Change={handleLevel3Change}
        onLevel4Change={handleLevel4Change}
        onClose={closeCreateModal}
        onSubmit={handleCreateSubmit}
        isLoading={createLoading}
        error={modalError}
      />

      <ProductEditModal
        isOpen={isEditOpen}
        form={form}
        level1Categories={parentCategories}
        level2Categories={level2Categories}
        level3Categories={level3Categories}
        level4Categories={level4Categories}
        onChange={handleChange}
        onLevel1Change={handleParentChange}
        onLevel2Change={handleLevel2Change}
        onLevel3Change={handleLevel3Change}
        onLevel4Change={handleLevel4Change}
        onClose={closeEditModal}
        onSubmit={handleEditSubmit}
        onDelete={handleOpenDeleteModal}
        isLoading={editLoading || deleteLoading}
        deleteLoading={deleteLoading}
        error={modalError}
      />

      <ProductDeleteModal companyId={companyId} onDeleted={fetchProducts} />
    </div>
  );
}
