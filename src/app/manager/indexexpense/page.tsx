"use client";

import { useEffect, useState } from "react";
import { Sidebar, NotificationPanel } from "@/app/components";
import { FaBars, FaBell } from "react-icons/fa";
import axios from "axios";

interface RuningExpense {
  amount: string;
  purpose: string;
}

interface SalaryExpense {
  amount: string;
  employee: string;
}

interface OfficeExpense {
  amount: string;
  item: string;
}

interface AgentCommission {
  amount: string;
  agent_name: string;
}

interface Expense {
  id: number;
  title: string;
  amount: string;
  description: string;
  created_at: string;
  runing_expenses: RuningExpense[];
  salary_expenses: SalaryExpense[];
  office_expenses: OfficeExpense[];
  agent_commissions: AgentCommission[];
}

export default function IndexExpense() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const res = await axios.get("http://127.0.0.1:8000/api/expenses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExpenses(res.data);
      } catch (error) {
        alert("Failed to load expenses");
      }
    };

    fetchExpenses();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="md:hidden bg-white p-4 flex justify-between border-b">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <FaBars />
        </button>
        <h1 className="text-xl font-bold">Manager Dashboard</h1>
        <button onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
          <FaBell />
        </button>
      </div>

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

      <main className="bg-white flex-1 p-6 md:p-10">
        <h1 className="text-2xl font-bold mb-6">All Expenses</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-xl">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-t">
                  <td className="px-4 py-2">{expense.title}</td>
                  <td className="px-4 py-2">{expense.amount}</td>
                  <td className="px-4 py-2">{expense.description}</td>
                  <td className="px-4 py-2">
                    {new Date(expense.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      
    </div>
  );
}
