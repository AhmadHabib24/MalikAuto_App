// components/GroupedExpenses.tsx

"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface GroupedExpense {
  country: string;
  month: string;
  total_amount: number;
}

export default function GroupedExpenses() {
  const [groupedExpenses, setGroupedExpenses] = useState<GroupedExpense[]>([]);

  useEffect(() => {
    const fetchGroupedExpenses = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const res = await axios.get("http://127.0.0.1:8000/api/expenses/grouped", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroupedExpenses(res.data);
      } catch (error) {
        alert("Failed to load grouped expenses");
      }
    };

    fetchGroupedExpenses();
  }, []);

  return (
    <div className="bg-white flex-1 p-6 md:p-10">
      <h1 className="text-2xl font-bold mb-6">Monthly Expenses by Country</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupedExpenses.map((expense, index) => (
          <div key={index} className="border rounded-xl p-4 shadow-sm bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">{expense.country}</h2>
            <p><strong>Month:</strong> {expense.month}</p>
            <p><strong>Total Amount:</strong> {expense.total_amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
