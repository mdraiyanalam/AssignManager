'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface SubjectItem {
    id: string;
    name: string;
    code?: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
}

export default function AdminSubjectsPage() {
    const [subjects, setSubjects] = useState<SubjectItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        isActive: true,
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchSubjects = async (page = 1) => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/subjects?pageNumber=${page}&pageSize=10`);
            setSubjects(res.data.items || []);
            setTotalPages(res.data.totalPages || 1);
            setPageNumber(res.data.pageNumber || 1);
        } catch (err) {
            console.error(err);
            setError('Failed to load subjects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await api.post('/admin/subjects', formData);
            setSuccess('Subject created successfully');
            setShowModal(false);
            setFormData({ name: '', code: '', description: '', isActive: true });
            fetchSubjects(pageNumber);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create subject');
        }
    };

    return (
        <div>
            <header className="bg-white shadow">
                <div className="px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Manage Subjects</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        + Create Subject
                    </button>
                </div>
            </header>

            <main className="p-8">
                {error && (
                    <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg">{error}</div>
                )}
                {success && (
                    <div className="mb-4 bg-green-100 text-green-700 px-4 py-3 rounded-lg">{success}</div>
                )}

                <div className="bg-white rounded-xl shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading subjects...</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Name</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Code</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Description</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            No subjects found
                                        </td>
                                    </tr>
                                ) : (
                                    subjects.map((subject) => (
                                        <tr key={subject.id} className="border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium">{subject.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{subject.code || '—'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                {subject.description || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs ${subject.isActive
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    {subject.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="mt-4 flex justify-center gap-2">
                        <button
                            disabled={pageNumber <= 1}
                            onClick={() => fetchSubjects(pageNumber - 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1">
                            Page {pageNumber} of {totalPages}
                        </span>
                        <button
                            disabled={pageNumber >= totalPages}
                            onClick={() => fetchSubjects(pageNumber + 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-lg font-bold mb-4">Create New Subject</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Subject Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="e.g. Data Structures"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Code</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="e.g. CSE210"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    rows={3}
                                    placeholder="Brief description of the subject"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 border rounded-lg py-2 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}