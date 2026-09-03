import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useRouter } from 'next/navigation';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-center border-b border-gray-200 bg-white">
        <Link href="/" className="text-xl font-bold text-blue-600">
          My Blog
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">{children}</main>
    </div>
  );
}