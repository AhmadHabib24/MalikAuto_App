"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Role = "admin" | "manager";

export default function Sidebar() {
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("userRole") as Role | null;
      if (storedRole === "admin" || storedRole === "manager") {
        setRole(storedRole);
      } else {
        setRole(null);
      }
    }
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("No token found");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("userRole");
        alert(data.message);
        window.location.href = "/"; // Redirect to login
      } else {
        alert("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("Something went wrong");
    }
  };

  const menuByRole: Record<Role, { title: string; add: boolean; index: boolean }[]> = {
    admin: [
      { title: "Role", add: true, index: true },
      { title: "Car Profile", add: true, index: true },
      { title: "Inventory", add: true, index: true },
      { title: "Branches", add: false, index: true },
      { title: "Profit & Loss", add: false, index: true },
    ],
    manager: [
      { title: "Role", add: false, index: true },
      { title: "Inventory", add: false, index: true },
      { title: "Expense", add: true, index: true },
    ],
  };

  // Only allow indexing with valid Role keys
  const menuItems = role && role in menuByRole ? menuByRole[role] : [];

  return (
    <aside className="w-64 h-screen bg-white text-black border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-4 border-b">
        <Link href={role === "admin" ? "/admin" : role === "manager" ? "/manager" : "/"}>
          <Image
            src="/images/logo.png"
            alt="Company Logo"
            width={160}
            height={80}
            className="cursor-pointer"
          />
        </Link>
      </div>

      {/* Scrollable Menu Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2 p-4">
          {menuItems.length === 0 && (
            <p className="text-gray-500 text-sm">No menu items available.</p>
          )}

          {menuItems.map(({ title, add, index }) => (
            <MenuGroup key={title} title={title} showAdd={add} showIndex={index} role={role} />
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full text-left text-red-600 hover:text-red-800 font-semibold"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

interface MenuGroupProps {
  title: string;
  showAdd: boolean;
  showIndex: boolean;
  role: Role | null;
}

function MenuGroup({ title, showAdd, showIndex, role }: MenuGroupProps) {
  const formatted = title.toLowerCase().replace(/\s+/g, "");

  // Base path changes depending on role
  const basePath = role === "admin" ? "/admin" : role === "manager" ? "/manager" : "";

  return (
    <div className="group">
      <div className="flex items-center justify-between cursor-pointer py-2">
        <h2 className="text-base font-semibold">{title}</h2>
        <svg
          className="w-4 h-4 transition-transform group-hover:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <ul className="hidden group-hover:block space-y-1 pl-4">
        {showAdd && (
          <li>
            <Link href={`${basePath}/add${formatted}`} className="text-sm py-1 block">
              ADD
            </Link>
          </li>
        )}
        {showAdd && showIndex && <hr />}
        {showIndex && (
          <li>
            <Link href={`${basePath}/index${formatted}`} className="text-sm py-1 block">
              Index
            </Link>
          </li>
        )}
      </ul>
      <hr className="my-2" />
    </div>
  );
}
