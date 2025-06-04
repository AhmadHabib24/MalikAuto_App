'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';

interface Country {
  id: number;
  name: string;
}

export default function LoginCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const router = useRouter();

  // 🔹 Fetch countries from API on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/countries');
        setCountries(response.data);
      } catch (err) {
        console.error('Error fetching countries:', err);
      }
    };

    fetchCountries();
  }, []);

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const response = await axios.post('http://127.0.0.1:8000/api/login', {
      email,
      password,
    });

    const { token, user } = response.data;
    const role = user.role;

    if (token) {
      // Token save karo
      localStorage.setItem('access_token', token);
      localStorage.setItem('userRole', role);

      // User ki country state mein store karo
      setUserCountry(user.country?.name || null);

      // Agar chaaho to localStorage mein bhi save kar sakte ho (optional)
      localStorage.setItem('userCountry', user.country?.name || '');

      // Cookies bhi set kar lo middleware ke liye agar use karte ho
      document.cookie = `token=${token}; path=/; max-age=86400`;
      document.cookie = `userRole=${role}; path=/; max-age=86400`;

      // Redirect kar do
      switch (role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'sales':
          router.push('/sales');
          break;
        case 'manager':
          router.push('/manager');
          break;
        default:
          router.push('/');
      }
    }
  } catch (err) {
    console.error(err);
    setError('Invalid credentials. Please try again.');
  } finally {
    setLoading(false);
  }
};


  // 🔹 Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('userRole');
    const country = localStorage.getItem('userCountry');

    if (token && role) {
      setUserCountry(country);
      switch (role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'sales':
          router.push('/sales');
          break;
        case 'manager':
          router.push('/manager');
          break;
        default:
          router.push('/');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Form Section */}
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="mt-2 text-gray-600">
              Please enter your login credentials to access the dashboard.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email:
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="example@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password:
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              {userCountry && (
  <p className="text-green-600">🌍 Your Country: <strong>{userCountry}</strong></p>
)}

              <div className="mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 border border-black text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don’t have an account?{' '}
                <Link href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>

          {/* Image Section */}
          <div className="hidden md:block relative h-full">
            <Image
              src="/images/login.png"
              alt="Login background"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
