"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBars, FaBell } from "react-icons/fa";
import { Sidebar, NotificationPanel } from "@/app/components";

interface Role {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    country_id: number | "";
    roleName: string;
    permissions: string[];
    description: string;
    userRole: string;
}

const countries = [
    { id: 1, name: "Japan" },
    { id: 2, name: "UAE" },
    { id: 3, name: "Pakistan" },
];

const permissionsList = ["View", "Add", "Edit", "Delete"];
const userRoles = ["Admin", "Manager", "Sales"];

export default function UpdateRole({ id }: { id: string }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<Role>({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        country_id: "",
        roleName: "",
        permissions: [],
        description: "",
        userRole: "",
    });
    useEffect(() => {
        const storedToken = localStorage.getItem("access_token");
        setToken(storedToken);
    }, []);
    useEffect(() => {
        if (!token) return;
        axios
            .get(`http://127.0.0.1:8000/api/roles/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setRole(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setRole(prev => ({
            ...prev,
            [name]: name === "country_id" ? Number(value) : value,
        }));
    };

    const handlePermissionToggle = (perm: string) => {
        setRole(prev => ({
            ...prev,
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter((p) => p !== perm)
                : [...prev.permissions, perm],
        }));
    };

    const handleUpdate = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return alert("You must be logged in");

        try {
            await axios.put(
                `http://127.0.0.1:8000/api/roles/${id}`,
                role,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            alert("Role updated successfully!");
        } catch (error) {
            console.error(error);
            alert("Error updating role.");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="flex flex-col md:flex-row min-h-screen relative">
            {/* Header */}
            <div className="md:hidden bg-white p-4 flex items-center justify-between border-b sticky top-0 z-40">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <FaBars className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <button onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
                    <FaBell className="w-6 h-6" />
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed md:static inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 z-40 w-64 bg-white transition-transform`}
            >
                <Sidebar />
            </div>

            {/* Main Content */}
            <main className="bg-white flex-1 p-4 md:p-8">
                <h1 className="text-2xl font-bold mb-8">Update Role</h1>

                <div className="border border-blue-700 rounded-xl p-6 md:p-10 max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Profile Preview */}
                        <div className="flex-shrink-0 text-center">
                            <img
                                src="/images/profile.jpg"
                                alt="Profile"
                                className="w-20 h-20 rounded-full mx-auto mb-2"
                            />
                            <h2 className="font-semibold text-sm text-blue-800">{role.name || "Name"}</h2>
                            <p className="text-xs text-gray-500">{role.userRole || "User Role"}</p>
                        </div>

                        {/* Form */}
                        <div className="flex-1 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    label="Name"
                                    name="name"
                                    value={role.name}
                                    onChange={handleChange}
                                />
                                <InputField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={role.email}
                                    onChange={handleChange}
                                />
                                <InputField
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={role.password}
                                    onChange={handleChange}
                                />
                                <InputField
                                    label="Confirm Password"
                                    name="password_confirmation"
                                    type="password"
                                    value={role.password_confirmation}
                                    onChange={handleChange}
                                />

                                {/* Country */}
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Country
                                    </label>
                                    <select
                                        name="country_id"
                                        onChange={handleChange}
                                        value={role.country_id}
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
                                        required
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Role Name */}
                                <InputField
                                    label="Role Name"
                                    name="roleName"
                                    value={role.roleName}
                                    onChange={handleChange}
                                />

                                {/* User Role */}
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        User Role
                                    </label>
                                    <select
                                        name="userRole"
                                        onChange={handleChange}
                                        value={role.userRole}
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
                                        required
                                    >
                                        <option value="">Select Role</option>
                                        {userRoles.map((r) => (
                                            <option key={r} value={r}>
                                                {r}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Permissions */}
                                <div className="col-span-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Permissions
                                    </label>
                                    <div className="flex gap-4 flex-wrap">
                                        {permissionsList.map((perm) => (
                                            <label key={perm} className="mr-4">
                                                <input
                                                    type="checkbox"
                                                    checked={role.permissions.includes(perm)}
                                                    onChange={() => handlePermissionToggle(perm)}
                                                />
                                                <span className="ml-1">{perm}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="col-span-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        onChange={handleChange}
                                        value={role.description}
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleUpdate}
                                className="block w-full py-3 bg-blue-700 text-white font-semibold rounded-md hover:bg-blue-800 transition"
                            >
                                Update Role
                            </button>
                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
}

// InputField component
function InputField({
    label,
    name,
    value,
    onChange,
    type = "text",
}: {
    label: string;
    name: string;
    value: string;
    onChange: any;
    type?: string;
}) {
    return (
        <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
                {label}
            </label>
            <input
                name={name}
                type={type}
                onChange={onChange}
                value={value}
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
                required
            />
        </div>
    );
}