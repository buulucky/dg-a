import { useState } from "react";
import type { Company } from "./companyService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (form: Partial<Company>) => Promise<void>;
};

export default function AddCompanyModal({ open, onClose, onAdd }: Props) {
  const [form, setForm] = useState<Partial<Company>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onAdd(form);
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setForm({});
      onClose();
    }, 800);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-xl min-w-[260px] max-w-xs relative animate-fade-in">
        {/* ปุ่มปิด */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
          aria-label="Close"
          type="button"
        >
          ×
        </button>
        <h2 className="text-lg font-bold mb-4 text-blue-700 text-center">
          Add Company
        </h2>
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            name="name"
            placeholder="Name"
            value={form.name || ""}
            onChange={handleChange}
            required
          />
          <Input
            name="address"
            placeholder="Address"
            value={form.address || ""}
            onChange={handleChange}
          />
          <Input
            name="phone"
            placeholder="Phone"
            value={form.phone || ""}
            onChange={handleChange}
          />
          <Input
            name="email"
            placeholder="Email"
            value={form.email || ""}
            onChange={handleChange}
          />
          <div className="flex justify-end gap-2 mt-3">
            <Button variant="cancel" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="default">
              {loading ? "Saving..." : "Add"}
            </Button>
          </div>
          {success && (
            <div className="text-green-600 text-center mt-2 animate-fade-in text-sm">
              Company added!
            </div>
          )}
        </form>
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s;
        }
      `}</style>
    </div>
  );
}
