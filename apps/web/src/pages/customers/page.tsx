"use client";

import { useEffect, useMemo, useState } from "react";
import Loading from "../../common/components/loading/Loading";
import { Pagination } from "../../common/components/pagination";
import { useAuth } from "../../common/contexts/AuthContext";
import {
  createCustomer,
  deleteCustomer,
  fetchCustomers,
  recordCustomerPaymentTotals,
  updateCustomer,
} from "../../common/actions/customers.actions";
import {
  createTillTransaction,
  fetchTills,
  type Till,
} from "../../common/actions/tills.actions";
import TillTransactionModal from "../kasalar/components/TillTransactionModal";
import CustomersModal from "./components/CustomersModal";
import CustomersTable from "./components/CustomersTable";
import {
  emptyCustomerForm,
  type Customer,
  type CustomerFormState,
} from "./types/customer.types";

const ITEMS_PER_PAGE = 20;
const BRANCH_STORAGE_KEY = "selectedBranchName";

type TransferTillOption = Till & { branchName: string };

export default function CustomersPage() {
  const { user, branches } = useAuth();
  const companyId = user?.companyId;

  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [branchTills, setBranchTills] = useState<TransferTillOption[]>([]);
  const [selectedTillId, setSelectedTillId] = useState<number | null>(null);

  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState<CustomerFormState>(emptyCustomerForm());
  const [modalError, setModalError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentCustomer, setPaymentCustomer] = useState<Customer | null>(null);

  const selectedTill = useMemo(
    () => branchTills.find((t) => t.id === selectedTillId) ?? null,
    [branchTills, selectedTillId],
  );

  useEffect(() => {
    if (!branches.length) {
      setSelectedBranchId(null);
      return;
    }
    const savedBranchName = localStorage.getItem(BRANCH_STORAGE_KEY);
    const savedBranch = branches.find((b) => b.name === savedBranchName);
    setSelectedBranchId(savedBranch?.id ?? branches[0]?.id ?? null);
  }, [branches]);

  useEffect(() => {
    if (!companyId || !selectedBranchId) {
      setBranchTills([]);
      setSelectedTillId(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const tills = await fetchTills(companyId, selectedBranchId);
        if (cancelled) return;
        const branchName =
          branches.find((b) => b.id === selectedBranchId)?.name ?? "";
        const mapped = tills.map((t) => ({ ...t, branchName }));
        setBranchTills(mapped);
        setSelectedTillId(mapped[0]?.id ?? null);
      } catch {
        if (!cancelled) {
          setBranchTills([]);
          setSelectedTillId(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [companyId, selectedBranchId, branches]);

  const loadCustomers = async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchCustomers(companyId);
      setAllCustomers(list);
      setCustomers(list);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCustomers();
  }, [companyId]);

  useEffect(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) {
      setCustomers(allCustomers);
      setCurrentPage(1);
      return;
    }
    setCustomers(
      allCustomers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone || "").toLowerCase().includes(q) ||
          (c.email || "").toLowerCase().includes(q),
      ),
    );
    setCurrentPage(1);
  }, [searchTerm, allCustomers]);

  const totalPages = Math.max(1, Math.ceil(customers.length / ITEMS_PER_PAGE));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return customers.slice(start, start + ITEMS_PER_PAGE);
  }, [customers, currentPage]);

  const handleChange = (
    field: keyof CustomerFormState,
    value: string | boolean,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreate = () => {
    setForm(emptyCustomerForm());
    setModalError(null);
    setIsCreateOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setActiveCustomer(customer);
    setForm({
      name: customer.name,
      contactPerson: customer.contactPerson || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      taxNumber: customer.taxNumber || "",
      status: customer.status === "inactive" ? "inactive" : "active",
    });
    setModalError(null);
    setIsEditOpen(true);
  };

  const openPaymentModal = (customer: Customer) => {
    if (!selectedBranchId || !branchTills.length) {
      setError("Bu filialda kassa yoxdur. Əvvəlcə kassa təyin edin.");
      return;
    }
    setError(null);
    setPaymentCustomer(customer);
    setPaymentOpen(true);
  };

  const handlePaymentSubmit = async (payload: {
    type: string;
    amount: number;
    description?: string;
    counterpartyType?: "supplier" | "customer";
    counterpartyId?: number;
    counterpartyName?: string;
    category?: string;
    paymentMethod?: string;
    currency?: string;
  }) => {
    if (!companyId || !selectedTill || !paymentCustomer) return;

    await createTillTransaction(selectedTill.id, {
      companyId,
      type: "medaxil",
      amount: payload.amount,
      description:
        payload.description || `Müştəri ödənişi: ${paymentCustomer.name}`,
      paymentMethod: payload.paymentMethod,
      category: payload.category || "Müştəri ödənişi",
      currency: payload.currency,
      counterpartyType: "customer",
      counterpartyId: paymentCustomer.id,
      counterpartyName: paymentCustomer.name,
    });

    await recordCustomerPaymentTotals(
      paymentCustomer.id,
      companyId,
      payload.amount,
    );

    await loadCustomers();
    setPaymentOpen(false);
    setPaymentCustomer(null);
  };

  const handleCreate = async () => {
    if (!companyId || !form.name.trim()) {
      setModalError("Müştəri adı mütləqdir.");
      return;
    }
    setCreateLoading(true);
    setModalError(null);
    try {
      await createCustomer({ ...form, companyId });
      setIsCreateOpen(false);
      await loadCustomers();
    } catch (e) {
      setModalError((e as Error).message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!companyId || !activeCustomer || !form.name.trim()) {
      setModalError("Müştəri adı mütləqdir.");
      return;
    }
    setEditLoading(true);
    setModalError(null);
    try {
      await updateCustomer(activeCustomer.id, { ...form, companyId });
      setIsEditOpen(false);
      setActiveCustomer(null);
      await loadCustomers();
    } catch (e) {
      setModalError((e as Error).message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!companyId || !activeCustomer) return;
    if (!window.confirm(`"${activeCustomer.name}" silinsin?`)) return;
    setDeleteLoading(true);
    setModalError(null);
    try {
      await deleteCustomer(activeCustomer.id, companyId);
      setIsEditOpen(false);
      setActiveCustomer(null);
      await loadCustomers();
    } catch (e) {
      setModalError((e as Error).message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="shrink-0 border-b border-border bg-card px-4 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Müştəri adı, telefon və ya e-poçt ilə axtar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary sm:w-80"
            />
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="rounded bg-success px-3 py-2 text-sm font-medium text-success-foreground hover:bg-success/90"
          >
            + Yarat
          </button>
        </div>
        {error ? (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
        {loading && !customers.length ? (
          <div className="flex h-full items-center justify-center">
            <Loading />
          </div>
        ) : (
          <CustomersTable
            customers={paginated}
            onRowClick={openEdit}
            onAddPayment={openPaymentModal}
          />
        )}
      </div>

      <div className="shrink-0">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRows={customers.length}
          onPageChange={setCurrentPage}
        />
      </div>

      <CustomersModal
        isOpen={isCreateOpen}
        title="Yeni müştəri"
        submitLabel="Yarat"
        form={form}
        onChange={handleChange}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={() => void handleCreate()}
        isLoading={createLoading}
        error={modalError}
      />

      <CustomersModal
        isOpen={isEditOpen}
        title="Müştərini düzənlə"
        submitLabel="Saxla"
        form={form}
        onChange={handleChange}
        onClose={() => {
          setIsEditOpen(false);
          setActiveCustomer(null);
        }}
        onSubmit={() => void handleEdit()}
        onDelete={() => void handleDelete()}
        isLoading={editLoading}
        deleteLoading={deleteLoading}
        error={modalError}
      />

      <TillTransactionModal
        isOpen={paymentOpen}
        mode="create"
        tillBalance={selectedTill?.balance ?? 0}
        sourceTillId={selectedTill?.id ?? 0}
        sourceTillName={selectedTill?.name}
        availableTills={branchTills}
        selectableSourceTill
        onSourceTillChange={setSelectedTillId}
        presetCounterparty={
          paymentCustomer
            ? {
                id: paymentCustomer.id,
                name: paymentCustomer.name,
                type: "customer",
              }
            : null
        }
        counterpartyDebt={
          paymentCustomer
            ? Number(paymentCustomer.totalSales || 0) -
              Number(paymentCustomer.totalReturn || 0) -
              Number(paymentCustomer.totalPayment || 0)
            : undefined
        }
        lockCounterparty
        defaultType="medaxil"
        defaultCategory="Müştəri ödənişi"
        titleOverride="Müştəri ödənişi"
        onClose={() => {
          setPaymentOpen(false);
          setPaymentCustomer(null);
        }}
        onSubmit={handlePaymentSubmit}
      />
    </div>
  );
}
