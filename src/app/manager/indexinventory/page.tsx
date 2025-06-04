"use client";

import { useEffect, useState } from "react";
import { Sidebar, NotificationPanel } from "@/app/components";
import { FaBars, FaBell } from "react-icons/fa";
import axios from "axios";
import { useRouter } from "next/navigation";


// Types
interface InventoryItem {
  id: number;
  car_id: number;
   car?: {
    rec_no: string;
  };
  price: string;
  details: string;
  current_currency: string;
  exchange_rate: string;
}

export default function InventoryIndex() {
    const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map car_id to rec_no
  const carIdToRecNo: Record<number, string> = {
    101: "REC-001",
    102: "REC-002",
    103: "REC-003",
    // Add all your mappings here...
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleNotifications = () => setIsNotificationOpen(!isNotificationOpen);

  useEffect(() => {
    const fetchInventory = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("You must be logged in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/inventory", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInventories(response.data.data || []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch inventory.");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);
const handleDelete = async (id: number) => {
  const confirmDelete = confirm(`Are you sure you want to delete inventory #${id}?`);
  if (!confirmDelete) return;

  const token = localStorage.getItem("access_token");
  if (!token) {
    alert("You must be logged in.");
    return;
  }

  try {
    await axios.delete(`http://127.0.0.1:8000/api/inventory/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Remove item from the state
    setInventories((prev) => prev.filter((item) => item.id !== id));
    alert("Inventory deleted successfully.");
  } catch (error) {
    console.error("Delete error:", error);
    alert("Failed to delete inventory.");
  }
};

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex items-center justify-between border-b sticky top-0 z-40">
        <button onClick={toggleSidebar}>
          <FaBars className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Inventory</h1>
        <button onClick={toggleNotifications}>
          <FaBell className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar overlays */}
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
        <h2 className="text-2xl font-semibold mb-4">Inventory List</h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        ) : inventories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No inventory items found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-2 px-3 border-b">#</th>
                  <th className="text-left py-2 px-3 border-b">Inventory ID</th>
                  <th className="text-left py-2 px-3 border-b">Rec No</th>
                  <th className="text-left py-2 px-3 border-b">Price</th>
                  <th className="text-left py-2 px-3 border-b">Currency</th>
                  <th className="text-left py-2 px-3 border-b">Exchange Rate</th>
                  <th className="text-left py-2 px-3 border-b">Details</th>
                  <th className="text-center py-2 px-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventories.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-1 px-3 border-b">{index + 1}</td>
                    <td className="py-1 px-3 border-b">{item.id}</td>
                    <td className="py-1 px-3 border-b">{item.car?.rec_no || "N/A"}</td>
                    <td className="py-1 px-3 border-b font-semibold text-green-600">
                      {item.price}
                    </td>
                    <td className="py-1 px-3 border-b">{item.current_currency}</td>
                    <td className="py-1 px-3 border-b">{item.exchange_rate}</td>
                    <td className="py-1 px-3 border-b max-w-xs break-words">
                      {item.details || "-"}
                    </td>
                    <td className="py-1 px-3 border-b text-center space-x-2">
                     <button
  onClick={() => router.push(`/admin/indexinventory/${item.id}/edit`)}
  className="text-blue-600 hover:text-blue-800 font-medium"
  title="Edit"
>
  Edit
</button>
                     
                      
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Notification Panel */}
      
    </div>
  );
}
