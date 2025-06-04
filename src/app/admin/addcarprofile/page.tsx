"use client";

import { useEffect, useState } from "react";
import { Sidebar, NotificationPanel } from "@/app/components";
import { FaBars, FaBell } from "react-icons/fa";
import axios from "axios";

interface FormState {
  recNo: string;
  locatedYard: string;
  grade: string;
  seats: string;
  chassis: string;
  shift: string;
  mileage: string;
  fuel: string;
  maxLoading: string;
  engineCC: string;
  dimension: string;
  m3: string;
  country_id: string;
  price: string;
}

interface Country {
  id: number;
  name: string;
}

export default function AddCarProfile() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    recNo: "",
    locatedYard: "",
    grade: "",
    seats: "",
    chassis: "",
    shift: "",
    mileage: "",
    fuel: "",
    maxLoading: "",
    engineCC: "",
    dimension: "",
    m3: "",
    country_id: "",
    price: "",
  });
  const [carImage, setCarImage] = useState<File | null>(null);
  const [carVideo, setCarVideo] = useState<File | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("You must be logged in");
        return;
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/countriesselect", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCountries(response.data);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
        alert("Failed to load countries");
      }
    };

    fetchCountries();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "price") {
      // Only allow numbers and decimal points
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video"
  ) => {
    const file = e.target.files?.[0] || null;
    if (type === "image") setCarImage(file);
    else setCarVideo(file);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("You must be logged in");
      return;
    }

    if (!formData.recNo || !formData.chassis || !formData.country_id || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formPayload.append(key, value);
      });
      
      if (carImage) formPayload.append("carImage", carImage);
      if (carVideo) formPayload.append("carVideo", carVideo);

      const response = await axios.post("http://127.0.0.1:8000/api/cars", formPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Car profile saved successfully!");
      setFormData({
        recNo: "",
        locatedYard: "",
        grade: "",
        seats: "",
        chassis: "",
        shift: "",
        mileage: "",
        fuel: "",
        maxLoading: "",
        engineCC: "",
        dimension: "",
        m3: "",
        country_id: "",
        price: "",
      });
      setCarImage(null);
      setCarVideo(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'An error occurred';
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
      {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />}
      <div className={`fixed md:static inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 w-64 bg-white transition-transform z-40`}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="bg-white flex-1 p-6 md:p-10">
        <h1 className="text-2xl font-bold mb-6">Add Car Profile</h1>

        <div className="bg-blue-50 border border-blue-700 rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Regular text fields */}
            {[
              { label: "Rec No", name: "recNo" },
              { label: "Located Yard", name: "locatedYard" },
              { label: "Grade", name: "grade" },
              { label: "Seats", name: "seats" },
              { label: "Chassis", name: "chassis" },
              { label: "Shift", name: "shift" },
              { label: "Mileage", name: "mileage" },
              { label: "Engine CC", name: "engineCC" },
              { label: "Dimension", name: "dimension" },
              { label: "M3", name: "m3" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                <input
                  type="text"
                  name={field.name}
                  value={(formData as any)[field.name]}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                />
              </div>
            ))}

            {/* Price Field - Special handling */}
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

            {/* Dropdown fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Fuel</label>
              <select name="fuel" value={formData.fuel} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
                {["", "Petrol", "Diesel", "Electric", "Hybrid"].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Max Loading</label>
              <select name="maxLoading" value={formData.maxLoading} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
                {["", "500kg", "750kg", "1000kg", "1500kg"].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <select name="country_id" value={formData.country_id} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
                <option value="">Select Country</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* File upload fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Car Image</label>
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "image")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Car Video</label>
              <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, "video")} />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Car Profile"}
            </button>
          </div>
        </div>
      </main>

      
    </div>
  );
}