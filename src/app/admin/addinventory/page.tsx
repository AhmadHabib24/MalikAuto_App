"use client";

import { useEffect, useState } from "react";
import { Sidebar, NotificationPanel } from "@/app/components";
import { FaBars, FaBell } from "react-icons/fa";
import axios from "axios";

interface InventoryFormState {
  car_id: string;
  price: string;
  details: string;
  current_currency: string;
  exchange_rate: string;
}

interface Car {
  id: number;
  rec_no: string; // Changed from recNo to rec_no to match API response
  chassis: string;
}

interface Currency {
  code: string;
  name: string;
}

export default function AddInventory() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [formData, setFormData] = useState<InventoryFormState>({
    car_id: "",
    price: "",
    details: "",
    current_currency: "",
    exchange_rate: "",
  });
  const [cars, setCars] = useState<Car[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("You must be logged in");
        return;
      }

      try {
        // Fetch cars - try different endpoint that should return rec_no
        const carsResponse = await axios.get("http://127.0.0.1:8000/api/cars", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log("Cars response:", carsResponse.data); // Debug log
        setCars(carsResponse.data);

      } catch (error) {
        console.error("Failed to fetch data:", error);
        alert("Failed to load required data");
      }
    };

    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // For price and exchange_rate, allow only numeric input including decimals
    if ((name === "price" || name === "exchange_rate") && value !== "") {
      // Allow numbers and decimals only (you can customize validation here)
      const regex = /^\d*\.?\d*$/;
      if (!regex.test(value)) return; // ignore invalid input
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("You must be logged in");
      return;
    }

    if (!formData.car_id || !formData.price || !formData.current_currency) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // Optionally convert numeric fields
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        exchange_rate: formData.exchange_rate ? parseFloat(formData.exchange_rate) : null,
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/api/inventory",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Inventory item added successfully!");
      setFormData({
        car_id: "",
        price: "",
        details: "",
        current_currency: "",
        exchange_rate: "",
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || "An error occurred";
        alert(message);
      } else {
        alert("Unexpected error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex justify-between border-b">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}><FaBars /></button>
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button onClick={() => setIsNotificationOpen(!isNotificationOpen)}><FaBell /></button>
      </div>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed md:static inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-64 bg-white transition-transform z-40`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="bg-white flex-1 p-6 md:p-10">
        <h1 className="text-2xl font-bold mb-6">Add Inventory</h1>

        <div className="bg-blue-50 border border-blue-700 rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Select Car</label>
              <select
                name="car_id"
                value={formData.car_id}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md px-3 py-2"
              >
                <option value="">Select a Car</option>
                {cars.map((car) => (
                  <option key={car.id} value={String(car.id)}>
                    {car.rec_no || car.chassis} {/* Show rec_no or fallback to chassis */}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md px-3 py-2"
                placeholder="Enter price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Current Currency</label>
              <input
                type="text"
                name="current_currency"
                value={formData.current_currency}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md px-3 py-2"
                placeholder="Enter currency code (e.g. USD)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Exchange Rate</label>
              <input
                type="text"
                name="exchange_rate"
                value={formData.exchange_rate}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md px-3 py-2"
                placeholder="Enter exchange rate"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Details</label>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full border rounded-md px-3 py-2"
                placeholder="Enter additional details about this inventory item"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Inventory"}
            </button>
          </div>
        </div>
      </main>

     
    </div>
  );
}