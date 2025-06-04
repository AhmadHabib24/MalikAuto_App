'use client';

import { useState, useEffect } from 'react';
import CarInventoryCard from './CarInventoryCard';

interface Car {
  id: string;
  rec_no: string;
  grade: string;
  located_yard: string;
  price: number;
  car_image?: string;
  year?: number;
  model_year?: number;
  country_id: string;
}

interface Country {
  id: string;
  name: string;
}

interface Props {
  countryId: string | null;
}

export default function CountryInventorySection({ countryId }: Props) {
  const [cars, setCars] = useState<Car[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [assignedCountryId, setAssignedCountryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
       const token = localStorage.getItem('access_token');
      console.log('token:', token);
        const userRole = localStorage.getItem('userRole');
        const userCountryName = localStorage.getItem('userCountry')?.trim() ?? null;

        setRole(userRole);

        const countriesRes = await fetch('http://127.0.0.1:8000/api/countries', {
 headers: {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
},
});

if (!countriesRes.ok) {
  const text = await countriesRes.text(); // get raw HTML/error response
  console.error('Countries API error:', countriesRes.status, text);
  throw new Error('Failed to fetch countries');
}

const countriesData: Country[] = await countriesRes.json();


        const matchedCountry = countriesData.find(
          (c) => c.name.trim() === userCountryName
        );
        const userCountryId = matchedCountry ? String(matchedCountry.id) : null;
        setAssignedCountryId(userCountryId);

        const carsRes = await fetch('http://127.0.0.1:8000/api/cars', {
         headers: {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
},
        });
        const carsData: Car[] = await carsRes.json();

        let filteredCountries = countriesData;
        let filteredCars = carsData;

        if ((userRole === 'manager' || userRole === 'sales') && userCountryId) {
  filteredCountries = countriesData.filter((c) => String(c.id) === userCountryId);
  filteredCars = carsData.filter((car) => String(car.country_id) === userCountryId);
} else if (userRole === 'admin') {
  filteredCountries = countriesData;
  filteredCars = carsData;
}

        setCountries(filteredCountries);
        setCars(filteredCars);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMarkAsSold = async (carId: string) => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/cars/${carId}/mark-sold`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        setCars((prevCars) =>
          prevCars.map((car) =>
            car.id === carId ? { ...car, located_yard: 'Sold' } : car
          )
        );
      } else {
        const errorData = await res.json();
        
        console.error('Failed to mark as sold:', errorData);
      }
    } catch (error) {
      console.error('Error marking car as sold:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading inventory...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 mb-4">
      {countries.map((country) => {
        const countryCars = cars.filter((car) => car.country_id === country.id);
        const carCount = countryCars.length;

        return (
          <div
            key={country.id}
            className="bg-white border-2 border-blue-500 rounded-xl p-3 overflow-hidden"
          >
            <h2 className="font-semibold text-sm mb-3">
              {country.name} Inventory ({carCount})
            </h2>

            {carCount > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {countryCars.slice(0, 4).map((car) => {
                    const imageUrl = car.car_image
                      ? `http://127.0.0.1:8000/storage/${car.car_image}`
                      : '/images/car-placeholder.png';

                    return (
                      <div key={car.id} className="border rounded-lg p-2 shadow-sm">
                        <CarInventoryCard
                          image={imageUrl}
                          name={`${car.rec_no} - ${car.grade}`}
                          year={car.year || 2020}
                          modelYear={car.model_year || 2020}
                          status={car.located_yard}
                          
                          priceLabel={`FOB$ ${(car.price ?? 0).toLocaleString()}`}
                        />
                        {role === 'manager' && car.located_yard !== 'Sold' && (
                          <div className="text-center mt-2">
                            <button
                              onClick={() => handleMarkAsSold(car.id)}
                              className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                            >
                              Mark as Sold
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {carCount > 4 && (
                  <div className="flex justify-center">
                    <button className="border border-blue-500 text-blue-500 px-4 py-1 text-sm rounded-md hover:bg-blue-500 hover:text-white transition">
                      View All ({carCount})
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No cars available in this country
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
