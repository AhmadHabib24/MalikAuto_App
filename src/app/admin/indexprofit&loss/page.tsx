"use client";

import { useState, useEffect } from "react";
import { FaBars, FaBell } from "react-icons/fa";
import { Sidebar, NotificationPanel } from "@/app/components";

type CarProfitLoss = {
  country_id: number;
  month: string;
  total_car_price: number | null;
  total_expense: string;
  profit: number;
  loss: number;
};

// Simple Doughnut Chart component using SVG
const DoughnutChart = ({ data }: { data: { labels: string[]; datasets: any[] } }) => {
  const total = data.datasets[0].data.reduce((sum: number, val: number) => sum + val, 0);
  const profit = data.datasets[0].data[0];
  const loss = data.datasets[0].data[1];

  const profitPercentage = total > 0 ? (profit / total) * 100 : 0;
  const lossPercentage = total > 0 ? (loss / total) * 100 : 0;

  // Circumference of circle with radius 80
  const circumference = 2 * Math.PI * 80;

  return (
    <div className="relative w-72 h-72 mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="20"
        />
        {/* Profit Circle */}
        {profit > 0 && (
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="rgba(34, 197, 94, 0.7)"
            strokeWidth="20"
            strokeDasharray={`${(profitPercentage / 100) * circumference} ${circumference}`}
            strokeDashoffset="0"
          />
        )}
        {/* Loss Circle */}
        {loss > 0 && (
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="rgba(239, 68, 68, 0.7)"
            strokeWidth="20"
            strokeDasharray={`${(lossPercentage / 100) * circumference} ${circumference}`}
            strokeDashoffset={`-${(profitPercentage / 100) * circumference}`}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold">
            {total > 0 ? `$${total.toLocaleString()}` : "$0"}
          </div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
      </div>
    </div>
  );
};

export default function ProfitLossIndex() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [carsData, setCarsData] = useState<CarProfitLoss[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfitLoss() {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("access_token");
        const headers: Record<string, string> = {
          Accept: "application/json",
          "Content-Type": "application/json",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch("http://127.0.0.1:8000/api/cars-profit-loss", {
          method: "GET",
          headers,
          credentials: "include",
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
        }

        const data: CarProfitLoss[] = await res.json();
        setCarsData(data);
      } catch (error: any) {
        setError(error.message);
        // Fallback mock data if API fails
        const mockData: CarProfitLoss[] = [
          {
            country_id: 1,
            month: "2025-05",
            total_car_price: null,
            total_expense: "515360.00",
            profit: 0,
            loss: 515360,
          },
          {
            country_id: 2,
            month: "2025-05",
            total_car_price: 999,
            total_expense: "0",
            profit: 999,
            loss: 0,
          },
          {
            country_id: 3,
            month: "2025-05",
            total_car_price: null,
            total_expense: "0",
            profit: 0,
            loss: 0,
          },
        ];
        setCarsData(mockData);
      } finally {
        setLoading(false);
      }
    }

    fetchProfitLoss();
  }, []);

  // Calculate totals
  const totalProfit = carsData.reduce((sum, car) => sum + (Number(car.profit) || 0), 0);
  const totalLoss = carsData.reduce((sum, car) => sum + (Number(car.loss) || 0), 0);
  const totalExpense = carsData.reduce((sum, car) => sum + (Number(car.total_expense) || 0), 0);

  const chartData = {
    labels: ["Profit", "Loss"],
    datasets: [
      {
        label: "Profit & Loss",
        data: [totalProfit, totalLoss],
        backgroundColor: ["rgba(34, 197, 94, 0.7)", "rgba(239, 68, 68, 0.7)"],
        borderColor: ["rgba(34,197,94,1)", "rgba(239,68,68,1)"],
        borderWidth: 2,
      },
    ],
  };

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
        <h1 className="text-xl font-bold text-gray-800">Profit & Loss</h1>
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
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Profit & Loss</h1>

          {loading && (
            <div className="text-center text-gray-500">Loading data...</div>
          )}

          {!loading && (
            <>
              <div className="flex flex-col md:flex-row gap-6 mb-10 justify-center">
                <div className="max-w-md w-full p-6 rounded-lg bg-white shadow-md">
                  <h2 className="text-xl font-semibold mb-2">Total Profit</h2>
                  <p className="text-green-600 font-bold text-3xl">
                    ${totalProfit.toLocaleString()}
                  </p>
                </div>
                <div className="max-w-md w-full p-6 rounded-lg bg-white shadow-md">
                  <h2 className="text-xl font-semibold mb-2">Total Loss</h2>
                  <p className="text-red-600 font-bold text-3xl">
                    ${totalLoss.toLocaleString()}
                  </p>
                </div>
                <div className="max-w-md w-full p-6 rounded-lg bg-white shadow-md">
                  <h2 className="text-xl font-semibold mb-2">Total Expense</h2>
                  <p className="text-gray-800 font-bold text-3xl">
                    ${totalExpense.toLocaleString()}
                  </p>
                </div>
              </div>

              <DoughnutChart data={chartData} />

              <div className="overflow-x-auto mt-10">
                <table className="min-w-full divide-y divide-gray-200 border rounded-lg shadow">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Country ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Car Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Expense
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profit
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loss
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {carsData.map((car, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {car.country_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {car.month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {car.total_car_price !== null
                            ? `$${car.total_car_price.toLocaleString()}`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          ${Number(car.total_expense).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">
                          ${car.profit.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-semibold">
                          ${car.loss.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Notification panel */}
      {isNotificationOpen && (
        <div className="fixed right-0 top-0 h-full w-64 bg-white border-l z-40 shadow-xl transform transition-transform duration-300 ease-in-out">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              <button 
                onClick={() => setIsNotificationOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          </div>
          {/* <NotificationPanel /> */}
        </div>
      )}
    </div>
  );
}