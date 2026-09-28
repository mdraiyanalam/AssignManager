'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface AssignmentItem {
    id: string;
    title: string;
    description?: string;
    deadline: string;
    maxMarks: number;
    isPublished: boolean;
    createdAt: string;
    className: string;
    subjectName: string;
}

export default function TeacherDashboardPage() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();

    const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
    const [stats, setStats] = useState({
        totalAssignments: 0,
        published: 0,
        drafts: 0,
    });
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading) {
            if (!user) router.push('/login');
            else if (!user.roles?.includes('Teacher')) router.push('/login');
        }
    }, [user, loading, router]);

    const fetchAssignments = async () => {
        try {
            setLoadingData(true);
            setError('');
            const res = await api.get('/teacher/assignments?pageNumber=1&pageSize=50');
            const items = res.data.items || [];
            setAssignments(items);
            setStats({
                totalAssignments: res.data.totalCount || items.length,
                published: items.filter((a: AssignmentItem) => a.isPublished).length,
                drafts: items.filter((a: AssignmentItem) => !a.isPublished).length,
            });
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401) {
                setError('Session expired. Please login again.');
            } else {
                setError('Failed to load assignments');
            }
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (user?.roles?.includes('Teacher')) {
            fetchAssignments();
        }
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this assignment?')) return;
        try {
            await api.delete(`/teacher/assignments/${id}`);
            fetchAssignments();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete');
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Teacher Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                            Welcome, <strong>{user.fullName}</strong>
                        </span>
                        <Link href="/profile" className="text-blue-600 text-sm hover:underline">
                            Profile
                        </Link>
                        <button
                            onClick={logout}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg">{error}</div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="text-gray-500 text-sm">Total Assignments</h3>
                        <p className="text-3xl font-bold mt-2 text-blue-600">
                            {loadingData ? '...' : stats.totalAssignments}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="text-gray-500 text-sm">Published</h3>
                        <p className="text-3xl font-bold mt-2 text-green-600">
                            {loadingData ? '...' : stats.published}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="text-gray-500 text-sm">Drafts</h3>
                        <p className="text-3xl font-bold mt-2 text-orange-600">
                            {loadingData ? '...' : stats.drafts}
                        </p>
                    </div>
                </div>

                <div className="mb-4">
                    <Link
                        href="/teacher/assignments/create"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        + Create Assignment
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-lg font-semibold">My Assignments</h2>
                    </div>

                    {loadingData ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Title</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Class</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Subject</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Deadline</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                No assignments yet. Create one!
                                            </td>
                                        </tr>
                                    ) : (
                                        assignments.map((item) => (
                                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium">{item.title}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{item.className}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{item.subjectName}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {new Date(item.deadline).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs ${item.isPublished
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                            }`}
                                                    >
                                                        {item.isPublished ? 'Published' : 'Draft'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <Link
                                                            href={`/teacher/assignments/${item.id}/submissions`}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            Submissions
                                                        </Link>
                                                        <Link
                                                            href={`/teacher/assignments/${item.id}/edit`}
                                                            className="text-green-600 hover:underline"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="text-red-600 hover:underline"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}