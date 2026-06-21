import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-white p-6 flex flex-col gap-6">
      <h1 className="text-xl font-bold mb-24">Travel Planner</h1>
      <nav className="flex flex-col gap-3">
        <Link href="/" className="hover:bg-gray-100 p-2 rounded-md transition">
          Dashboard
        </Link>
        <Link
          href="/requests/new"
          className="hover:bg-gray-100 p-2 rounded-md transition"
        >
          Nova Solicitação
        </Link>
        <Link
          href="/requests"
          className="hover:bg-gray-100 p-2 rounded-md transition"
        >
          Solicitações
        </Link>

        <Link
          href="/guests"
          className="hover:bg-gray-100 p-2 rounded-md transition"
        >
          Hóspedes
        </Link>
      </nav>
    </aside>
  );
}
