"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBars, FaBell } from "react-icons/fa";
import { Sidebar } from "@/app/components"; // adjust if needed

interface InventoryItem {
  id?: number;
  car_id?: number;
  name?: string;
  details: string;
  current_currency: string;
  price: number;
  exchange_rate: number;
  created_at?: string;
  updated_at?: string;
}

export default function UpdateInventoryClient({ id }: { id: string }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem>({
    details: "",
    current_currency: "",
    price: 0,
    exchange_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      setError("Authentication token not found");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchInventory = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/inventory/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setInventory(res.data);
      } catch (err) {
        setError("Failed to load inventory item.");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [id, token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const updatedValue = type === "number" ? Number(value) : value;

    setInventory((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const handleUpdate = async () => {
    if (!token) return alert("Missing auth token.");

    try {
      setLoading(true);
      await axios.put(
        `http://127.0.0.1:8000/api/inventory/${id}`,
        inventory,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Inventory updated successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to update inventory.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 transition-transform bg-white ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Sidebar />
      </div>

      {/* Content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="flex justify-between items-center mb-6 md:hidden">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <FaBars className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Update Inventory</h1>
          <FaBell className="w-6 h-6" />
        </div>

        <div className="space-y-4 max-w-3xl">
          <InputField label="ID" name="id" value={inventory.id ?? ""} readOnly />
          <InputField
            label="Car ID"
            name="car_id"
            value={inventory.car_id ?? ""}
            onChange={handleChange}
            type="number"
          />
          <TextAreaField
            label="Details"
            name="details"
            value={inventory.details}
            onChange={handleChange}
          />
          <InputField
            label="Currency"
            name="current_currency"
            value={inventory.current_currency}
            onChange={handleChange}
          />
          <InputField
            label="Price"
            name="price"
            value={inventory.price}
            onChange={handleChange}
            type="number"
          />
          <InputField
            label="Exchange Rate"
            name="exchange_rate"
            value={inventory.exchange_rate}
            onChange={handleChange}
            type="number"
          />
          <button
            onClick={handleUpdate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded"
          >
            {loading ? "Updating..." : "Update Inventory"}
          </button>
        </div>
      </main>
    </div>
  );
}

// Input field component
const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  readOnly = false,
}: any) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={`w-full border px-3 py-2 rounded ${
        readOnly ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
    />
  </div>
);

// Textarea component
const TextAreaField = ({ label, name, value, onChange }: any) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border px-3 py-2 rounded"
      rows={4}
    />
  </div>
);
