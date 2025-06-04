'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InventoryCard, Sidebar, NotificationPanel } from '@/app/components';
import CountryInventorySection from '@/app/components/CountryInventorySection';
import { FaBars, FaBell } from 'react-icons/fa';

interface Country {
    id: string;
    name: string;
}

interface Car {
    country_id: string;
}

export default function Home() {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [countries, setCountries] = useState<Country[]>([]);
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleNotifications = () => setIsNotificationOpen(!isNotificationOpen);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('access_token');
            console.log('token:', token);
            const role = localStorage.getItem('userRole');
            
            if (!token) {
                router.push('/login');
            } else if (role !== 'admin') {
                router.push(`/${role}`);
            }
        }
    }, [router]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [countriesRes, carsRes] = await Promise.all([
                    fetch('http://127.0.0.1:8000/api/countries'),
                    fetch('http://127.0.0.1:8000/api/cars')
                ]);
                
                const countriesData = await countriesRes.json();
                const carsData = await carsRes.json();
                
                setCountries(countriesData);
                setCars(carsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="flex flex-col md:flex-row min-h-screen relative">
            {/* Mobile Header */}
            <div className="md:hidden bg-white p-4 flex items-center justify-between border-b sticky top-0 z-40">
                <button onClick={toggleSidebar} className="text-gray-600 focus:outline-none" aria-label="Open Sidebar">
                    <FaBars className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <button onClick={toggleNotifications} className="text-gray-600 focus:outline-none" aria-label="Open Notifications">
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
                    Welcome to Admin Dashboard
                </h1>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 mb-6 md:mb-8">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-gray-200 h-24 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 mb-6 md:mb-8">
                        {countries.map(country => (
                            <InventoryCard
                                key={country.id}
                                title={`Total Cars In ${country.name}`}
                                value={cars.filter(car => car.country_id === country.id).length.toString()}
                            />
                        ))}
                    </div>
                )}

                {/* Country Inventory Section */}
              {countries.map(country => (
  <CountryInventorySection key={country.id} countryId={country.id} />
))}
            </main>

           
        </div>
    );
}