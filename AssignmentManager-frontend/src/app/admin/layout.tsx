'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) router.push('/login');
            else if (!user.roles?.includes('Admin')) router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    const menuItems = [
        { href: '/admin', label: 'Dashboard' },
        { href: '/admin/users', label: 'Manage Users' },
        { href: '/admin/classes', label: 'Manage Classes' },
        { href: '/admin/subjects', label: 'Manage Subjects' },
        { href: '/admin/teacher-assignments', label: 'Assign Teachers' },
        { href: '/admin/enrollments', label: 'Enrollments' },
        { href: '/admin/assignments', label: 'All Assignments' },
        { href: '/admin/submissions', label: 'All Submissions' },
        { href: '/admin/settings', label: 'Settings' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <aside className="w-64 bg-white shadow-md min-h-screen fixed">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-blue-600">Assignment Manager</h2>
                    <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
                </div>

                <nav className="p-4 space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`block px-4 py-2.5 rounded-lg transition ${pathname === item.href
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-0 w-64 p-4 border-t">
                    <div className="mb-3 px-2">
                        <p className="text-sm font-medium text-gray-800">{user.fullName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link
                        href="/profile"
                        className="block w-full text-center border border-blue-600 text-blue-600 py-2 rounded-lg text-sm mb-2 hover:bg-blue-50"
                    >
                        Profile
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            <div className="flex-1 ml-64">{children}</div>
        </div>
    );
}