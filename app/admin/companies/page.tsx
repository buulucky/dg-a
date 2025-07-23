"use client";
import { useEffect, useState } from "react";
import {
  fetchCompanies,
  addCompany,
  updateCompany,
  deleteCompany,
  Company,
} from "./companyService";
import AddCompanyModal from "./AddCompanyModal";
import { Button } from "@/components/ui/button";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Company>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies()
      .then(setCompanies)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (form: Partial<Company>) => {
    await addCompany(form);
    setCompanies(await fetchCompanies());
  };

  const handleEdit = (company: Company) => {
    setEditId(company.id);
    setForm(company);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!editId) return;
    try {
      await updateCompany(editId, form);
      setCompanies(await fetchCompanies());
      setEditId(null);
      setForm({});
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteCompany(id);
      setCompanies(await fetchCompanies());
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Companies</h1>
      <button
        onClick={() => setShowAddModal(true)}
        className="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded shadow transition"
      >
        + Add Company
      </button>
      <AddCompanyModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAdd}
      />
      {error && (
        <div className="text-red-600 text-sm text-center my-4">{error}</div>
      )}
      <div className="overflow-x-auto rounded shadow">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-blue-100 text-blue-900">
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Address</th>
              <th className="border px-4 py-2 text-left">Phone</th>
              <th className="border px-4 py-2 text-left">Email</th>
              <th className="border px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              editId === c.id ? (
                <tr key={c.id} className="bg-yellow-50">
                  <td className="border px-4 py-2">
                    <input
                      name="name"
                      value={form.name || ""}
                      onChange={handleChange}
                      className="border p-2 rounded w-full bg-white"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      name="address"
                      value={form.address || ""}
                      onChange={handleChange}
                      className="border p-2 rounded w-full bg-white"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      name="phone"
                      value={form.phone || ""}
                      onChange={handleChange}
                      className="border p-2 rounded w-full bg-white"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      name="email"
                      value={form.email || ""}
                      onChange={handleChange}
                      className="border p-2 rounded w-full bg-white"
                    />
                  </td>
                  <td className="border px-4 py-2 text-center flex gap-2 justify-center">
                    <Button
                      type="button"
                      variant="save"
                      onClick={handleUpdate}
                      className="px-3 py-1"
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="cancel"
                      onClick={() => { setEditId(null); setForm({}); }}
                      className="px-3 py-1"
                    >
                      Cancel
                    </Button>
                  </td>
                </tr>
              ) : (
                <tr key={c.id} className="hover:bg-blue-50 transition">
                  <td className="border px-4 py-2">{c.name}</td>
                  <td className="border px-4 py-2">{c.address}</td>
                  <td className="border px-4 py-2">{c.phone}</td>
                  <td className="border px-4 py-2">{c.email}</td>
                  <td className="border px-4 py-2 text-center">
                    <Button
                      type="button"
                      variant="edit"
                      onClick={() => handleEdit(c)}
                      className="px-3 py-1 mr-2"
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => handleDelete(c.id)}
                      className="px-3 py-1"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              )
            ))}
            {companies.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-6">
                  No companies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}