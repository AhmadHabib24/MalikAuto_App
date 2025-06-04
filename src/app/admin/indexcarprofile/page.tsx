"use client";

import { useEffect, useState } from "react";
import { Sidebar, NotificationPanel } from "@/app/components";
import { FaBars, FaBell } from "react-icons/fa";
import Image from "next/image";
import axios from "axios";

// Types
interface Country {
  id: number;
  name: string;
}

interface CarProfile {
  id: number;
  rec_no: string;
  located_yard: string;
  grade: string;
  seats: string;
  chassis: string;
  shift: string;
  mileage: string;
  fuel: string;
  max_loading: string;
  engine_cc: string;
  dimension: string;
  m3: string;
  country: Country;
  car_image?: string;
  car_video?: string;
  modelYear?: string;
  year?: string;
  status?: string;
  price?: string;
}

export default function CarProfilesList() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [cars, setCars] = useState<CarProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleNotifications = () => setIsNotificationOpen(!isNotificationOpen);

  // Function to get the full image URL
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return "/api/placeholder/200/150";
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // If it's a relative path, prepend the storage URL
    return `http://127.0.0.1:8000/storage/${imagePath}`;
  };

  useEffect(() => {
    const fetchCars = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("You must be logged in");
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/cars", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCars(response.data);
      } catch (error) {
        console.error("Failed to fetch cars:", error);
        alert("Failed to load car profiles");
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);
  
  

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex items-center justify-between border-b sticky top-0 z-40">
        <button onClick={toggleSidebar}>
          <FaBars className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Car Profiles</h1>
        <button onClick={toggleNotifications}>
          <FaBell className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
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

      <div
        className={`fixed md:static inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-40 w-64 bg-white transition-transform duration-300 ease-in-out shadow-lg md:shadow-none`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">Car Profiles</h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No car profiles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cars.map((car) => (
              <div
                key={car.id}
                className="w-full border rounded-xl p-3 shadow-md bg-white hover:shadow-lg transition-shadow"
              >
                <div className="rounded overflow-hidden mb-3 aspect-[4/3] relative">
                  <Image
  src={getImageUrl(car.car_image)}
  alt={`${car.rec_no} - ${car.chassis}`}
  width={200}
  height={150}
  className="w-full h-full object-cover"
  unoptimized
  onError={(e) => {
    const target = e.target as HTMLImageElement;
    target.src = "/api/placeholder/200/150";
  }}
/>

                </div>
                
                <div className="space-y-1">
                  <div className="text-sm font-semibold truncate" title={car.rec_no}>
                    Rec No: {car.rec_no}
                  </div>
                  
                  <div className="text-xs text-gray-600 truncate" title={car.chassis}>
                    Chassis: {car.chassis}
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    Grade: {car.grade}
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    Fuel: {car.fuel}
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    Mileage: {car.mileage}
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    Country: {car.country?.name || 'N/A'}
                  </div>
                  
                  {car.year && (
                    <div className="text-xs text-gray-500">Year: {car.year}</div>
                  )}
                  
                  {car.modelYear && (
                    <div className="text-xs text-gray-500">
                      Model: {car.modelYear}
                    </div>
                  )}
                  
                  {car.status && (
                    <div
                      className={`text-xs mt-2 px-2 py-1 rounded-full text-center ${
                        car.status === "In Transit" || car.status === "In Tranzerd"
                          ? "bg-green-100 text-green-600"
                          : car.status === "Available"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-yellow-100 text-yellow-600"
                      } font-semibold`}
                    >
                      {car.status}
                    </div>
                  )}
                  
                  {car.price && (
                    <div className="text-xs text-right mt-2 font-semibold text-green-600">
                      ${car.price}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Notification Panel */}
      <div
        className={`fixed md:static inset-y-0 right-0 transform ${
          isNotificationOpen ? "translate-x-0" : "translate-x-full"
        } md:translate-x-0 z-40 w-64 bg-white transition-transform duration-300 ease-in-out shadow-lg md:shadow-none`}
      >
       
      </div>
    </div>
  );
}