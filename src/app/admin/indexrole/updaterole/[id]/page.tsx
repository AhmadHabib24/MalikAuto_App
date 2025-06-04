import UpdateRoleClient from "./UpdateRoleClient";

interface Role {
  id: number;
}

export async function generateStaticParams() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/roles");
    if (!res.ok) return [{ id: "1" }];
    const roles = await res.json();
    if (!Array.isArray(roles) || roles.length === 0) return [{ id: "1" }];
    return roles.map((role: Role) => ({ id: role.id.toString() }));
  } catch {
    return [{ id: "1" }];
  }
}

// Updated typing for Next.js 15 - params is now a Promise
interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function UpdateRolePage({ params }: PageProps) {
  // Await the params Promise in Next.js 15
  const resolvedParams = await params;
  return <UpdateRoleClient id={resolvedParams.id} />;
}