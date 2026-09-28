'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface AssignmentItem {
    id: string;
    title: string;
    description?: string;
    deadline: string;
    maxMarks: number;
    isPublished: boolean;
    createdAt: string;
    teacherName: string;
    className: string;
    subjectName: string;
}

export default function AdminAssignmentsPage() {
    const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');

    const fetchAssignments = async (page = 1) => {
        try {
            setLoading(true);
            const res = await api.get(
                `/admin/assignments?pageNumber=${page}&pageSize=10`
            );
            setAssignments(res.data.items || []);
            setTotalPages(res.data.totalPages || 1);
            setPageNumber(res.data.pageNumber || 1);
        } catch (err) {
            console.error(err);
            setError('Failed to load assignments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    return (
        <div>
            <header className="bg-white shadow">
                <div className="px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">All Assignments</h1>
                </div>
            </header>

            <main className="p-8">
                {error && (
                    <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">
                            Loading assignments...
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                            Title
                                        </th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                            Teacher
                                        </th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                            Class
                                        </th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                            Subject
                                        </th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                            Deadline
                                        </th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                            Marks
                                        </th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-6 py-8 text-center text-gray-500"
                                            >
                                                No assignments found
                                            </td>
                                        </tr>
                                    ) : (
                                        assignments.map((item) => (
                                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium">
                                                    {item.title}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {item.teacherName}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {item.className}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {item.subjectName}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {new Date(item.deadline).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {item.maxMarks}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs ${item.isPublished
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-yellow-100 text-yellow-700'
                                                            }`}
                                                    >
                                                        {item.isPublished ? 'Published' : 'Draft'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-4 flex justify-center gap-2">
                        <button
                            disabled={pageNumber <= 1}
                            onClick={() => fetchAssignments(pageNumber - 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1">
                            Page {pageNumber} of {totalPages}
                        </span>
                        <button
                            disabled={pageNumber >= totalPages}
                            onClick={() => fetchAssignments(pageNumber + 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}