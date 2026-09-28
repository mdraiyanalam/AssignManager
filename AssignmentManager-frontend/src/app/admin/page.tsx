'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalClasses: 0,
        totalSubjects: 0,
        totalAssignments: 0,
    });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoadingStats(true);
                const [usersRes, classesRes, subjectsRes, assignmentsRes] = await Promise.all([
                    api.get('/admin/users?pageNumber=1&pageSize=1'),
                    api.get('/admin/classes?pageNumber=1&pageSize=1'),
                    api.get('/admin/subjects?pageNumber=1&pageSize=1'),
                    api.get('/admin/assignments?pageNumber=1&pageSize=1'),
                ]);
                setStats({
                    totalUsers: usersRes.data.totalCount || 0,
                    totalClasses: classesRes.data.totalCount || 0,
                    totalSubjects: subjectsRes.data.totalCount || 0,
                    totalAssignments: assignmentsRes.data.totalCount || 0,
                });
            } catch (error) {
                console.error('Failed to load stats', error);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            <header className="bg-white shadow">
                <div className="px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                    <div className="text-gray-600">
                        Welcome, <strong>{user?.fullName}</strong>
                    </div>
                </div>
            </header>

            <main className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="text-gray-500 text-sm">Total Users</h3>
                        <p className="text-3xl font-bold mt-2 text-blue-600">
                            {loadingStats ? '...' : stats.totalUsers}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="text-gray-500 text-sm">Total Classes</h3>
                        <p className="text-3xl font-bold mt-2 text-green-600">
                            {loadingStats ? '...' : stats.totalClasses}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="text-gray-500 text-sm">Total Subjects</h3>
                        <p className="text-3xl font-bold mt-2 text-purple-600">
                            {loadingStats ? '...' : stats.totalSubjects}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="text-gray-500 text-sm">Total Assignments</h3>
                        <p className="text-3xl font-bold mt-2 text-orange-600">
                            {loadingStats ? '...' : stats.totalAssignments}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/admin/users" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                            Manage Users
                        </Link>
                        <Link href="/admin/classes" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                            Manage Classes
                        </Link>
                        <Link href="/admin/subjects" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
                            Manage Subjects
                        </Link>
                        <Link href="/admin/enrollments" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg">
                            Enroll Students
                        </Link>
                        <Link href="/admin/assignments" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
                            View All Assignments
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}