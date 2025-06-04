import UpdateInventoryClient from "./UpdateInventoryClient";

export const dynamicParams = false; // Required for static export

export async function generateStaticParams() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/inventory", {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('API returned non-JSON response, using fallback IDs');
      return generateFallbackParams();
    }

    if (!res.ok) {
      console.warn(`API returned status ${res.status}, using fallback IDs`);
      return generateFallbackParams();
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.warn("Inventory data is not an array, using fallback IDs");
      return generateFallbackParams();
    }

    return data.map((item: any) => ({ id: item.id.toString() }));
  } catch (error) {
    console.warn("API not available during build, using fallback IDs:", error);
    return generateFallbackParams();
  }
}

// Fallback function to provide static IDs when API is not accessible
function generateFallbackParams() {
  // Replace these with actual inventory IDs from your database
  // or return empty array if you don't want to pre-generate any pages
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' }
  ];
  
  // Or return empty array to skip static generation:
  // return [];
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <UpdateInventoryClient id={id} />;
}