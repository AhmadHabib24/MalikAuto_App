"use client";

import { useState, useEffect } from "react";
import { Sidebar, NotificationPanel } from "@/app/components";
import { FaBars, FaBell } from "react-icons/fa";
import axios from "axios";

interface ExpenseItem {
  amount: string;
  [key: string]: string;
}

interface FormData {
  title: string;
  amount: string;
  description: string;
  country: string;
  country_id: string;
}

interface Country {
  id: number;
  name: string;
}

export default function AddExpense() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableCountries, setAvailableCountries] = useState<Country[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [assignedCountryId, setAssignedCountryId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    amount: "0",
    description: "",
    country: "",
    country_id: "",
  });

  // Expense sections data
  const [runningExpenses, setRunningExpenses] = useState<ExpenseItem[]>([
    { amount: "", purpose: "" },
  ]);
  const [salaryExpenses, setSalaryExpenses] = useState<ExpenseItem[]>([
    { amount: "", employee: "" },
  ]);
  const [officeExpenses, setOfficeExpenses] = useState<ExpenseItem[]>([
    { amount: "", item: "" },
  ]);
  const [agentCommissions, setAgentCommissions] = useState<ExpenseItem[]>([
    { amount: "", agent_name: "" },
  ]);

  // Initialize form data and fetch countries
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const userRole = localStorage.getItem("userRole");
        const userCountryName = localStorage.getItem("userCountry")?.trim() ?? null;

        setRole(userRole);

        // Fetch countries
        const response = await axios.get("http://127.0.0.1:8000/api/countries", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const countriesData: Country[] = response.data;

        // Find country ID from country name stored in localStorage
        const matchedCountry = countriesData.find(
          (c) => c.name.trim() === userCountryName
        );
        const userCountryId = matchedCountry ? String(matchedCountry.id) : null;
        setAssignedCountryId(userCountryId);

        let filteredCountries = countriesData;

        // If manager, filter only their assigned country
        if (userRole === "manager" && userCountryId) {
          filteredCountries = countriesData.filter((c) => String(c.id) === userCountryId);
        }

        setAvailableCountries(filteredCountries);

        // Set initial form data
        if (userCountryName && userCountryName !== "null" && userCountryName !== "undefined") {
          setFormData(prev => ({ 
            ...prev, 
            country: userCountryName,
            country_id: userCountryId || "" 
          }));
        }
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      }
    };

    fetchData();
  }, []);

  // Calculate total amount whenever any expense changes
  useEffect(() => {
    let total = 0;
    const addAmounts = (items: ExpenseItem[]) => {
      items.forEach((item) => {
        const amount = parseFloat(item.amount) || 0;
        total += amount;
      });
    };
    addAmounts(runningExpenses);
    addAmounts(salaryExpenses);
    addAmounts(officeExpenses);
    addAmounts(agentCommissions);

    setFormData((prev) => ({
      ...prev,
      amount: total.toFixed(2),
    }));
  }, [runningExpenses, salaryExpenses, officeExpenses, agentCommissions]);

  // Handle basic form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "amount") return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle change inside expense arrays
  const handleArrayChange = (
    setter: React.Dispatch<React.SetStateAction<ExpenseItem[]>>,
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    if (name === "amount" && value !== "") {
      const regex = /^\d*\.?\d*$/;
      if (!regex.test(value)) return;
    }

    setter(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [name]: value };
      return updated;
    });
  };

  // Add a new row in expense arrays
  const addRow = (
    setter: React.Dispatch<React.SetStateAction<ExpenseItem[]>>,
    template: ExpenseItem
  ) => {
    setter(prev => [...prev, { ...template }]);
  };

  // Remove a row from expense arrays
  const removeRow = (
    setter: React.Dispatch<React.SetStateAction<ExpenseItem[]>>,
    index: number
  ) => {
    setter(prev => {
      if (prev.length > 1) {
        return prev.filter((_, i) => i !== index);
      }
      return prev;
    });
  };

  // Filter out empty expense items
  const filterFilled = (arr: ExpenseItem[], keys: string[]): ExpenseItem[] => {
    return arr.filter(
      (item) => !keys.every((key) => !item[key] || item[key].trim() === "")
    );
  };

  // Submit handler
  const handleSubmit = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("You must be logged in");
      return;
    }

    // Validate arrays
    const arraysToValidate = [
      { data: runningExpenses, keys: ["amount", "purpose"] },
      { data: salaryExpenses, keys: ["amount", "employee"] },
      { data: officeExpenses, keys: ["amount", "item"] },
      { data: agentCommissions, keys: ["amount", "agent_name"] },
    ];

    for (const { data, keys } of arraysToValidate) {
      for (const item of data) {
        if (keys.every((key) => !item[key] || item[key].trim() === "")) continue;

        for (const key of keys) {
          if (!item[key] || item[key].trim() === "") {
            alert(`Please fill all fields (${keys.join(" & ")}) for each filled item.`);
            return;
          }
        }
      }
    }

    setLoading(true);

    // Prepare payload
    const payload = {
      title: formData.title.trim(),
      amount: parseFloat(formData.amount) || 0,
      description: formData.description.trim(),
      country_id: parseInt(formData.country_id) || undefined,
      running_expenses: filterFilled(runningExpenses, ["amount", "purpose"]).map(
        (item) => ({
          amount: parseFloat(item.amount) || 0,
          purpose: item.purpose.trim(),
        })
      ),
      salary_expenses: filterFilled(salaryExpenses, ["amount", "employee"]).map(
        (item) => ({
          amount: parseFloat(item.amount) || 0,
          employee: item.employee.trim(),
        })
      ),
      office_expenses: filterFilled(officeExpenses, ["amount", "item"]).map(
        (item) => ({
          amount: parseFloat(item.amount) || 0,
          item: item.item.trim(),
        })
      ),
      agent_commissions: filterFilled(agentCommissions, ["amount", "agent_name"]).map(
        (item) => ({
          amount: parseFloat(item.amount) || 0,
          agent_name: item.agent_name.trim(),
        })
      ),
    };

    // Validate required fields
    if (!payload.title) {
      setLoading(false);
      alert("Please enter expense title/month");
      return;
    }
    if (!payload.country_id) {
      setLoading(false);
      alert("Country ID is required. Please ensure you're logged in properly.");
      return;
    }

    // At least one expense item required
    const hasExpenses =
      payload.running_expenses.length > 0 ||
      payload.salary_expenses.length > 0 ||
      payload.office_expenses.length > 0 ||
      payload.agent_commissions.length > 0;

    if (!hasExpenses) {
      setLoading(false);
      alert("Please add at least one expense item");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/expenses", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert("Expense added successfully!");

      // Reset form but keep country info
      setFormData(prev => ({
        title: "",
        amount: "0",
        description: "",
        country: prev.country,
        country_id: prev.country_id,
      }));
      setRunningExpenses([{ amount: "", purpose: "" }]);
      setSalaryExpenses([{ amount: "", employee: "" }]);
      setOfficeExpenses([{ amount: "", item: "" }]);
      setAgentCommissions([{ amount: "", agent_name: "" }]);
    } catch (error: any) {
      console.error("API Error:", error);
      if (error.response) {
        alert(
          `Error ${error.response.status}: ${
            error.response.data?.message || JSON.stringify(error.response.data)
          }`
        );
      } else if (error.request) {
        alert("Network error: No response from server");
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Render each expense section form rows
  const renderExpenseSection = (
    title: string,
    data: ExpenseItem[],
    setter: React.Dispatch<React.SetStateAction<ExpenseItem[]>>,
    keys: { name: string; placeholder: string }[]
  ) => (
    <div className="space-y-4 mb-8">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      {data.map((item, index) => (
        <div key={index} className="flex gap-4 items-center">
          {keys.map((key) => (
            <input
              key={key.name}
              type={key.name === "amount" ? "number" : "text"}
              min={key.name === "amount" ? "0" : undefined}
              step={key.name === "amount" ? "0.01" : undefined}
              name={key.name}
              value={item[key.name] || ""}
              onChange={(e) => handleArrayChange(setter, index, e)}
              placeholder={key.placeholder}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
            />
          ))}
          <button
            type="button"
            className="text-red-600 hover:text-red-800"
            onClick={() => removeRow(setter, index)}
            aria-label={`Remove ${title} row`}
            disabled={data.length === 1}
            title={data.length === 1 ? "At least one row required" : "Remove row"}
          >
            &times;
          </button>
        </div>
      ))}
      <button
        type="button"
        className="mt-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        onClick={() =>
          addRow(
            setter,
            keys.reduce((acc, cur) => ({ ...acc, [cur.name]: "" }), {} as ExpenseItem)
          )
        }
      >
        + Add {title}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center border-b shadow-sm">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          <FaBars className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Manager Dashboard</h1>
        <button 
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          <FaBell className="text-gray-600" />
        </button>
      </div>

      {/* Overlay for sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-64 bg-white transition-transform duration-300 ease-in-out z-40 shadow-lg`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Add Expense</h1>

          {/* Main form fields */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="title"
                placeholder="Expense Month (e.g., January 2024)"
                value={formData.title}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              
              {role === "admin" ? (
                <select
                  name="country_id"
                  value={formData.country_id}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Country</option>
                  {availableCountries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  readOnly
                  className="border border-gray-300 rounded-md px-4 py-3 bg-gray-100 cursor-not-allowed"
                />
              )}

              <input
                type="number"
                name="amount"
                placeholder="Total Amount"
                value={formData.amount}
                readOnly
                className="border border-gray-300 rounded-md px-4 py-3 bg-gray-100 cursor-not-allowed"
              />
              
              <textarea
                name="description"
                placeholder="Description (optional)"
                value={formData.description}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Expense sections */}
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-8">
            <h2 className="text-xl font-semibold text-gray-800">Expense Details</h2>
            
            {renderExpenseSection(
              "Running Expenses",
              runningExpenses,
              setRunningExpenses,
              [
                { name: "amount", placeholder: "Amount" },
                { name: "purpose", placeholder: "Purpose" },
              ]
            )}

            {renderExpenseSection(
              "Salary Expenses",
              salaryExpenses,
              setSalaryExpenses,
              [
                { name: "amount", placeholder: "Amount" },
                { name: "employee", placeholder: "Employee Name" },
              ]
            )}

            {renderExpenseSection(
              "Office Expenses",
              officeExpenses,
              setOfficeExpenses,
              [
                { name: "amount", placeholder: "Amount" },
                { name: "item", placeholder: "Item/Service" },
              ]
            )}

            {renderExpenseSection(
              "Agent Commissions",
              agentCommissions,
              setAgentCommissions,
              [
                { name: "amount", placeholder: "Amount" },
                { name: "agent_name", placeholder: "Agent Name" },
              ]
            )}
          </div>

          {/* Submit button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-8 py-3 rounded-md transition-colors duration-200 flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              )}
              {loading ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </div>
      </main>

      {/* Notification panel */}
     
    </div>
  );
}