"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FaBars, FaBell } from "react-icons/fa";
import { Sidebar, NotificationPanel } from "@/app/components";
import Swal from "sweetalert2";
import Link from "next/link";

type Role = {
  id: number;
  roleName: string;
  permissions: string;
  description: string;
  country_name: string;
};

export default function RoleIndex() {
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [rolesData, setRolesData] = useState<Role[]>([]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleNotifications = () => setIsNotificationOpen(!isNotificationOpen);

  useEffect(() => {
    const fetchRoles = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        await Swal.fire("Unauthorized", "No token found. Please log in again.", "error");
        router.push("/");
        return;
      }

      try {
        // Optional: You can pass country_id param here if you want to filter by country
        const response = await axios.get("http://127.0.0.1:8000/api/roles", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRolesData(response.data);
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          Swal.fire("Unauthorized", "Session expired. Please log in again.", "error").then(() => {
            localStorage.removeItem("access_token");
            router.push("/");
          });
        } else {
          console.error("Error fetching roles data:", error);
          Swal.fire("Error", "Failed to load roles data.", "error");
        }
      }
    };

    fetchRoles();
  }, [router]);

  const showFullDescription = (description: string) => {
    Swal.fire({
      title: "Full Description",
      text: description,
      icon: "info",
      confirmButtonText: "Close",
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex items-center justify-between border-b sticky top-0 z-40">
        <button onClick={toggleSidebar} aria-label="Open Sidebar">
          <FaBars className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button onClick={toggleNotifications} aria-label="Open Notifications">
          <FaBell className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
          aria-label="Close Sidebar Overlay"
        />
      )}

      {/* Notification Overlay */}
      {isNotificationOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleNotifications}
          aria-label="Close Notifications Overlay"
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
      <main className="flex-1 p-4 md:p-8">
        <h1 className="text-xl md:text-2xl font-bold mb-6">Roles</h1>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left text-sm font-semibold">Role Name</th>
                <th className="px-3 py-2 text-left text-sm font-semibold">Permissions</th>
                <th className="px-3 py-2 text-left text-sm font-semibold">Description</th>
                <th className="px-3 py-2 text-left text-sm font-semibold">Country</th>
                <th className="px-3 py-2 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rolesData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-sm text-gray-500">
                    No roles found.
                  </td>
                </tr>
              ) : (
                rolesData.map((role, index) => {
                  let permissionList: string[] = [];
                  try {
                    permissionList = JSON.parse(role.permissions);
                  } catch {
                    permissionList = [];
                  }

                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm">{role.roleName}</td>
                      <td className="px-3 py-2 text-sm">{permissionList.join(", ")}</td>
                      <td className="px-3 py-2 text-sm">
                        {role.description.length > 25 ? (
                          <>
                            {role.description.slice(0, 25)}...
                            <button
                              className="text-blue-600 hover:underline ml-1"
                              onClick={() => showFullDescription(role.description)}
                            >
                              See More
                            </button>
                          </>
                        ) : (
                          role.description
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm">{role.country_name}</td>
                      <td className="px-3 py-2 text-sm">
                        <Link
                          href={`/admin/indexrole/updaterole/${role.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <span className="mx-1">|</span>
                        <button className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Notification Panel */}
      
    </div>
  );
}
