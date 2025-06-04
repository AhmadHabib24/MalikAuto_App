"use client";

import { useEffect, useState } from "react";
import { Sidebar, NotificationPanel } from "@/app/components";
import { FaBars, FaBell } from "react-icons/fa";

interface Country {
  id: number;
  name: string;
}

export default function CountryBranches() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleNotifications = () => setIsNotificationOpen(!isNotificationOpen);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("You must be logged in");
      return;
    }

    const fetchCountries = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/countries", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch countries");
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error(error);
        alert("Failed to load countries");
      }
    };

    fetchCountries();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex items-center justify-between border-b sticky top-0 z-40">
        <button onClick={toggleSidebar}>
          <FaBars className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Branches (Countries)</h1>
        <button onClick={toggleNotifications}>
          <FaBell className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
      {isNotificationOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleNotifications}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-40 w-64 bg-white transition-transform duration-300 ease-in-out shadow-lg md:shadow-none`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
     <main className="flex-1 p-4 md:p-8 overflow-y-auto">
  <h2 className="text-2xl font-semibold mb-4">Branches (Countries)</h2>

  {countries.length === 0 ? (
    <p className="text-gray-500">No branches found.</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 rounded-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left py-2 px-4 border-b border-gray-300">ID</th>
            <th className="text-left py-2 px-4 border-b border-gray-300">Country Name</th>
          </tr>
        </thead>
        <tbody>
          {countries.map((country) => (
            <tr key={country.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b border-gray-300">{country.id}</td>
              <td className="py-2 px-4 border-b border-gray-300">{country.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</main>

     
    </div>
  );
}
