"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InventoryCard, Sidebar, NotificationPanel } from '@/app/components';
import CountryInventorySection from '@/app/components/CountryInventorySection';
import { FaBars, FaBell } from 'react-icons/fa';

export default function Home() {
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Store country name for display
  const [userCountryName, setUserCountryName] = useState<string | null>(null);

  // Store role and country for internal usage if needed
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userCountry, setUserCountry] = useState<string | null>(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  useEffect(() => {
    const fetchCountryName = async (countryId: string) => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`http://127.0.0.1:8000/api/countries/${countryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Country not found');
        const data = await res.json();
        setUserCountryName(data.name); // set country name for display
      } catch (e) {
        console.error(e);
        setUserCountryName(null);
      }
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      const role = localStorage.getItem('userRole');
      const countryId = localStorage.getItem('userCountry')?.trim() ?? null;

      setUserRole(role);
      setUserCountry(countryId);

      if (!token) {
        router.push('/login');
      } else if (role && role !== 'admin') {
        router.push(`/${role}`);
      } else if (countryId) {
        fetchCountryName(countryId);
      }
    }
  }, [router]);


  return (
    <div className="flex flex-col md:flex-row min-h-screen relative">
      {/* Mobile Header with Hamburger and Bell */}
      <div className="md:hidden bg-white p-4 flex items-center justify-between border-b sticky top-0 z-40">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 focus:outline-none"
          aria-label="Open Sidebar"
        >
          <FaBars className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button
          onClick={toggleNotifications}
          className="text-gray-600 focus:outline-none"
          aria-label="Open Notifications"
        >
          <FaBell className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
          role="button"
          aria-label="Close Sidebar Overlay"
        ></div>
      )}

      {/* Mobile Notifications Overlay */}
      {isNotificationOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleNotifications}
          role="button"
          aria-label="Close Notifications Overlay"
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 z-40 w-64 bg-white transition-transform duration-300 ease-in-out shadow-lg md:shadow-none`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="bg-white flex-1 p-4 md:p-8 md:ml-2">
        <h1 className="hidden md:block text-xl md:text-2xl font-bold mb-6 md:mb-8">
          Welcome to Manager Dashboard
        </h1>

        {/* Show user country if available */}
        {userCountry && (
          <p className="mb-4 text-green-700 font-semibold">
            🌍 Your Country: {userCountry}
          </p>
        )}

        

        {/* Country Inventory Section */}
         {userCountry && <CountryInventorySection countryId={userCountry} />}
      </main>

      {/* Notification Panel */}
      
    </div>
  );
}
