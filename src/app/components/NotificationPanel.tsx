'use client';
import React from 'react';
import { FaBell } from 'react-icons/fa';

// Define the User and Car types
interface User {
  id: string;
  name: string;
  email: string;
  country_id: string;
}

interface Car {
  id: string;
  car_image: string;
  grade: string;
  located_yard: string;
  price: number;
  country_id: string;
}

interface NotificationPanelProps {
  role: string;
  managerCountryId: string;
  users?: User[];
  activeUserIds?: string[];
  newCars?: Car[];
}

export default function NotificationPanel({
  role,
  managerCountryId,
  users = [],
  activeUserIds = [],
  newCars = [],
}: NotificationPanelProps) {
  // ⛳️ FIX: Explicitly type filteredUsers
  let filteredUsers: User[] = [];

  if (role === 'admin') {
    filteredUsers = users.filter(user => activeUserIds.includes(user.id));
  } else if (role === 'manager') {
    filteredUsers = users.filter(
      user => activeUserIds.includes(user.id) && user.country_id === managerCountryId
    );
  }

  const carsForNotification =
    role === 'manager'
      ? newCars.filter(car => car.country_id === managerCountryId)
      : [];

  return (
        <div className="bg-white h-full p-4 w-64 font-sans overflow-y-auto">
            <div className="md:hidden flex justify-end mb-2">
                <button className="text-gray-500">&times;</button>
            </div>

            <div className="flex items-center justify-between cursor-pointer">
                <h1 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <FaBell className="text-blue-500" />
                    Notification
                </h1>
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            <hr className="border-t border-gray-300 mb-4" />

            {/* New Cars Notification */}
            {carsForNotification.length > 0 && (
                <div className="mb-4 p-3 bg-green-100 rounded-md">
                    <h2 className="font-semibold text-base mb-2">New Cars Added</h2>
                    <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
                        {carsForNotification.map(car => (
                            <li key={car.id} className="flex items-center gap-2">
                                <img src={car.car_image} alt={`Car ${car.id}`} className="w-12 h-8 object-cover rounded" />
                                <div>
                                    <p><strong>Grade:</strong> {car.grade}</p>
                                    <p><strong>Located Yard:</strong> {car.located_yard}</p>
                                    <p><strong>Price:</strong> ${car.price}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Active Users Section */}
            <h2 className="font-semibold text-base mb-2">Active Users</h2>
            <ul className="text-sm space-y-2 mb-4">
                {filteredUsers.length === 0 ? (
                    <li>No active users to show.</li>
                ) : (
                    filteredUsers.map(user => (
                        <li key={user.id} className="bg-gray-100 rounded-md px-3 py-1">
                            {user.name} ({user.email})
                        </li>
                    ))
                )}
            </ul>

            {/* Rest of your sections */}
            {/* ... */}
        </div>
    );
}
