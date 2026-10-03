import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FiPlus,
  FiCreditCard,
  FiSmartphone,
  FiTrash2,
  FiEdit2,
  FiCheck,
  FiStar,
} from "react-icons/fi";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import PageHeader from "../Components/UI/PageHeader";
import EmptyState from "../Components/UI/EmptyState";
import DocumentTitle from "../Components/Seo/DocumentTitle";
import { notify } from "../lib/notify";
import { confirmAction } from "../lib/confirm";
import { useForm } from "react-hook-form";
import FormField from "../Components/UI/FormField";

const TYPE_ICONS = {
  card: FiCreditCard,
  mobile: FiSmartphone,
  wallet: FiSmartphone,
};

const TYPE_LABELS = {
  card: "Card",
  bank: "Bank",
  mobile: "Mobile",
  wallet: "Wallet",
};

const WALLET_TYPES = ["bkash", "nagad", "rocket", "upay", "other"];

const PaymentMethods = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const { data: methods = [], isLoading } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: async () => {
      const res = await axiosSecure.get("/payment-methods");
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosSecure.post("/payment-methods", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      notify.success("Payment method added");
      reset();
      setShowForm(false);
    },
    onError: (err) => notify.error(err?.response?.data?.message || "Failed to add payment method"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ paymentMethodId, data }) => {
      const res = await axiosSecure.patch(`/payment-methods/${paymentMethodId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      notify.success("Payment method updated");
      reset();
      setEditing(null);
    },
    onError: (err) => notify.error(err?.response?.data?.message || "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (paymentMethodId) => {
      const res = await axiosSecure.delete(`/payment-methods/${paymentMethodId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      notify.success("Payment method deleted");
    },
    onError: (err) => notify.error(err?.response?.data?.message || "Failed to delete"),
  });

  const defaultMutation = useMutation({
    mutationFn: async (paymentMethodId) => {
      const res = await axiosSecure.patch(`/payment-methods/${paymentMethodId}/default`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      notify.success("Default payment method updated");
    },
    onError: (err) => notify.error(err?.response?.data?.message || "Failed to set default"),
  });

  const onSubmit = (data) => {
    if (editing) {
      updateMutation.mutate({ paymentMethodId: editing._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (method) => {
    setEditing(method);
    setShowForm(true);
    for (const key of Object.keys(method)) {
      if (!["_id", "userId", "createdAt", "updatedAt"].includes(key)) {
        setValue(key, method[key]);
      }
    }
  };

  const handleDelete = async (paymentMethodId) => {
    const confirmed = await confirmAction({
      title: "Delete this payment method?",
      message: "This action cannot be undone.",
      confirmLabel: "Yes, delete",
      tone: "danger",
    });
    if (confirmed) {
      deleteMutation.mutate(paymentMethodId);
    }
  };

  if (isLoading) {
    return (
      <div>
        <DocumentTitle title="RapidParcelHub | Payment Methods" />
        <PageHeader
          eyebrow="Account"
          title="Payment Methods"
          description="Manage your saved payment methods for faster checkout."
        />
        <div className="flex justify-center py-20">
          <div className="loading loading-spinner loading-lg" />
        </div>
      </div>
    );
  }

  const IconForMethod = (method) => {
    const Icon = TYPE_ICONS[method.type] || FiCreditCard;
    return <Icon className="text-xl" aria-hidden="true" />;
  };

  return (
    <div>
      <DocumentTitle title="RapidParcelHub | Payment Methods" />
      <PageHeader
        eyebrow="Account"
        title="Payment Methods"
        description="Manage your saved payment methods for faster checkout."
        actions={
          <button
            type="button"
            onClick={() => {
              reset();
              setEditing(null);
              setShowForm(true);
            }}
            className="btn btn-primary gap-2"
          >
            <FiPlus className="mr-2" /> Add Payment Method
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <aside className={`lg:sticky lg:top-20 ${showForm ? "" : "hidden"}`}>
          <div className="rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold">
                {editing ? "Edit Payment Method" : "Add Payment Method"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setEditing(null);
                  setShowForm(false);
                }}
                className="btn btn-ghost btn-circle btn-sm"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField label="Type" htmlFor="type">
                <select
                  {...register("type")}
                  id="type"
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Select type</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank</option>
                  <option value="mobile">Mobile</option>
                  <option value="wallet">Wallet</option>
                </select>
              </FormField>
              <FormField label="Provider" htmlFor="provider">
                <input
                  {...register("provider")}
                  id="provider"
                  type="text"
                  placeholder="e.g., Stripe, Visa, Bkash"
                  className="input input-bordered w-full"
                  required
                />
              </FormField>
              <FormField label="Type Details" htmlFor="walletType">
                <select
                  {...register("walletType")}
                  id="walletType"
                  className="select select-bordered w-full"
                >
                  <option value="">Select wallet type (if wallet)</option>
                  {WALLET_TYPES.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Last 4 digits (cards/bank)" htmlFor="last4">
                <input
                  {...register("last4")}
                  id="last4"
                  type="text"
                  placeholder="1234"
                  className="input input-bordered w-full"
                  maxLength={4}
                  pattern="[0-9]{4}"
                />
              </FormField>
              <FormField label="Brand (cards)" htmlFor="brand">
                <input
                  {...register("brand")}
                  id="brand"
                  type="text"
                  placeholder="Visa, Mastercard, Amex"
                  className="input input-bordered w-full"
                />
              </FormField>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Expiry Month" htmlFor="expiryMonth">
                  <input
                    {...register("expiryMonth")}
                    id="expiryMonth"
                    type="number"
                    min="1"
                    max="12"
                    placeholder="MM"
                    className="input input-bordered w-full"
                  />
                </FormField>
                <FormField label="Expiry Year" htmlFor="expiryYear">
                  <input
                    {...register("expiryYear")}
                    id="expiryYear"
                    type="number"
                    min="2024"
                    max="2035"
                    placeholder="YYYY"
                    className="input input-bordered w-full"
                  />
                </FormField>
              </div>
              <FormField label="Bank Name" htmlFor="bankName">
                <input
                  {...register("bankName")}
                  id="bankName"
                  type="text"
                  placeholder="Bank name"
                  className="input input-bordered w-full"
                />
              </FormField>
              <FormField label="Account Last 4" htmlFor="accountLast4">
                <input
                  {...register("accountLast4")}
                  id="accountLast4"
                  type="text"
                  placeholder="5678"
                  className="input input-bordered w-full"
                  maxLength={4}
                  pattern="[0-9]{4}"
                />
              </FormField>
              <FormField label="Wallet Type" htmlFor="walletType">
                <select
                  {...register("walletType")}
                  id="walletType"
                  className="select select-bordered w-full"
                >
                  <option value="">Select wallet type</option>
                  {WALLET_TYPES.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Set as default" htmlFor="isDefault">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    {...register("isDefault")}
                    id="isDefault"
                    type="checkbox"
                    className="checkbox checkbox-primary"
                  />
                  <span>Set as default payment method</span>
                </label>
              </FormField>
              <div className="flex flex-wrap gap-2 mt-4">
                <button type="submit" className="btn btn-primary flex-1">
                  {editing ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setEditing(null);
                    setShowForm(false);
                  }}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </aside>

        <div>
          {methods.length === 0 && !isLoading ? (
            <EmptyState
              icon={FiCreditCard}
              title="No payment methods yet"
              body="Add your first payment method to speed up checkout."
              action={
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setShowForm(true);
                  }}
                  className="btn btn-primary"
                >
                  <FiPlus className="mr-2" /> Add Payment Method
                </button>
              }
            />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {methods.map((method) => (
                <article
                  key={method._id}
                  className="relative rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
                        <IconForMethod method={method} />
                      </div>
                      <div>
                        <p className="font-semibold">{TYPE_LABELS[method.type] || method.type}</p>
                        <p className="text-xs text-base-content/50 capitalize">{method.provider}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {method.isDefault && <FiCheck className="text-brand-500" title="Default" />}
                      {method.isDefault && (
                        <span className="badge badge-xs badge-primary">Default</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-base-content/70">
                    {method.type === "card" && (
                      <>
                        <p className="font-mono font-semibold">
                          {method.brand ? `${method.brand} ` : ""}•••• {method.last4 || "****"}
                        </p>
                        {method.expiryMonth && method.expiryYear && (
                          <p className="text-xs text-base-content/50">
                            Expires {method.expiryMonth}/{String(method.expiryYear).slice(-2)}
                          </p>
                        )}
                      </>
                    )}
                    {method.type === "bank" && (
                      <>
                        <p className="font-semibold">{method.bankName || "Bank"}</p>
                        <p className="text-xs text-base-content/50">
                          •••• {method.accountLast4 || "****"}
                        </p>
                      </>
                    )}
                    {method.type === "wallet" && (
                      <>
                        <p className="font-semibold">{method.walletType || "Wallet"}</p>
                        <p className="text-xs text-base-content/50">{method.provider}</p>
                      </>
                    )}
                    {method.type === "mobile" && (
                      <>
                        <p className="font-semibold">{method.provider}</p>
                        <p className="text-xs text-base-content/50">Mobile wallet</p>
                      </>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                    {!method.isDefault && (
                      <button
                        type="button"
                        onClick={() => defaultMutation.mutate(method._id)}
                        className="btn btn-outline btn-sm"
                      >
                        <FiStar className="mr-1" /> Set Default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleEdit(method)}
                      className="btn btn-ghost btn-sm"
                    >
                      <FiEdit2 className="mr-1" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(method._id)}
                      className="btn btn-error btn-sm"
                    >
                      <FiTrash2 className="mr-1" /> Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
