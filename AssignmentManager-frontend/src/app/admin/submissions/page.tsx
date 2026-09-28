'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface SubmissionItem {
    id: string;
    answer: string;
    submittedAt: string;
    marksObtained?: number;
    feedback?: string;
    status: string;
    studentName: string;
    assignmentTitle: string;
}

export default function AdminSubmissionsPage() {
    const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');

    const fetchSubmissions = async (page = 1) => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/submissions?pageNumber=${page}&pageSize=10`);
            setSubmissions(res.data.items || []);
            setTotalPages(res.data.totalPages || 1);
            setPageNumber(res.data.pageNumber || 1);
        } catch (err) {
            console.error(err);
            setError('Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    return (
        <div>
            <header className="bg-white shadow">
                <div className="px-8 py-4">
                    <h1 className="text-xl font-bold text-gray-800">All Submissions</h1>
                </div>
            </header>

            <main className="p-8">
                {error && (
                    <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg">{error}</div>
                )}

                <div className="bg-white rounded-xl shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading submissions...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Student</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Assignment</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Submitted At</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Marks</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Feedback</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                No submissions found
                                            </td>
                                        </tr>
                                    ) : (
                                        submissions.map((item) => (
                                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium">{item.studentName}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{item.assignmentTitle}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {new Date(item.submittedAt).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs ${item.status === 'Graded'
                                                                ? 'bg-purple-100 text-purple-700'
                                                                : 'bg-blue-100 text-blue-700'
                                                            }`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">{item.marksObtained ?? '—'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                    {item.feedback || '—'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="mt-4 flex justify-center gap-2">
                        <button
                            disabled={pageNumber <= 1}
                            onClick={() => fetchSubmissions(pageNumber - 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1">
                            Page {pageNumber} of {totalPages}
                        </span>
                        <button
                            disabled={pageNumber >= totalPages}
                            onClick={() => fetchSubmissions(pageNumber + 1)}
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