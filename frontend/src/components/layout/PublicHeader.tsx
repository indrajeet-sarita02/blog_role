'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Button } from '@/components/ui/Button';

export function PublicHeader() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-blue-600">
          My Blog
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-700 md:flex">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <Link href="/blog" className="hover:text-blue-600">
            Blog
          </Link>
          <Link href="/search" className="hover:text-blue-600">
            Search
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                {user?.name}
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}