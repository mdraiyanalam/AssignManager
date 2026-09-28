'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

export default function EditAssignmentPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const assignmentId = params.id as string;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        maxMarks: 20,
        isPublished: false,
        classId: '',
        subjectId: '',
    });

    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!loading) {
            if (!user) router.push('/login');
            else if (!user.roles?.includes('Teacher')) router.push('/login');
        }
    }, [user, loading, router]);

    // Load existing assignment data
    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                setLoadingData(true);

                // Get teacher's assignments and find the one we need
                const res = await api.get('/teacher/assignments?pageNumber=1&pageSize=100');
                const items = res.data.items || [];
                const assignment = items.find((a: any) => a.id === assignmentId);

                if (!assignment) {
                    setError('Assignment not found or you do not have permission');
                    return;
                }

                // Format deadline for datetime-local input
                const deadlineDate = new Date(assignment.deadline);
                const formattedDeadline = deadlineDate.toISOString().slice(0, 16);

                setFormData({
                    title: assignment.title || '',
                    description: assignment.description || '',
                    deadline: formattedDeadline,
                    maxMarks: assignment.maxMarks || 20,
                    isPublished: assignment.isPublished || false,
                    classId: assignment.classId || '',
                    subjectId: assignment.subjectId || '',
                });
            } catch (err) {
                console.error(err);
                setError('Failed to load assignment');
            } finally {
                setLoadingData(false);
            }
        };

        if (user?.roles?.includes('Teacher') && assignmentId) {
            fetchAssignment();
        }
    }, [user, assignmentId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            await api.put(`/teacher/assignments/${assignmentId}`, {
                title: formData.title,
                description: formData.description,
                deadline: new Date(formData.deadline).toISOString(),
                maxMarks: Number(formData.maxMarks),
                isPublished: formData.isPublished,
                classId: formData.classId || undefined,
                subjectId: formData.subjectId || undefined,
            });

            setSuccess('Assignment updated successfully');
            setTimeout(() => {
                router.push('/teacher');
            }, 1000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update assignment');
        } finally {
            setSubmitting(false);
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
                <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Edit Assignment</h1>
                    <Link href="/teacher" className="text-blue-600 hover:underline text-sm">
                        ← Back to Dashboard
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg">{error}</div>
                )}
                {success && (
                    <div className="mb-4 bg-green-100 text-green-700 px-4 py-3 rounded-lg">{success}</div>
                )}

                {loadingData ? (
                    <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                        Loading assignment...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title *</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Deadline *</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Max Marks *</label>
                                <input
                                    type="number"
                                    required
                                    min={1}
                                    value={formData.maxMarks}
                                    onChange={(e) =>
                                        setFormData({ ...formData, maxMarks: Number(e.target.value) })
                                    }
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isPublished"
                                checked={formData.isPublished}
                                onChange={(e) =>
                                    setFormData({ ...formData, isPublished: e.target.checked })
                                }
                            />
                            <label htmlFor="isPublished" className="text-sm">
                                Published
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Link
                                href="/teacher"
                                className="flex-1 border rounded-lg py-2 text-center hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 disabled:opacity-50"
                            >
                                {submitting ? 'Updating...' : 'Update Assignment'}
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}