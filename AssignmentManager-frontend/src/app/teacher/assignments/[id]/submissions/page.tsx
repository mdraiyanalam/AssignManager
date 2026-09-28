'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface SubmissionItem {
    id: string;
    studentName: string;
    studentEmail: string;
    answer: string;
    submittedAt: string;
    marksObtained?: number;
    feedback?: string;
    status: string;
}

export default function AssignmentSubmissionsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const assignmentId = params.id as string;

    const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [gradingId, setGradingId] = useState<string | null>(null);
    const [gradeForm, setGradeForm] = useState({
        marks: 0,
        feedback: '',
        status: 'Graded',
    });

    useEffect(() => {
        if (!loading) {
            if (!user) router.push('/login');
            else if (!user.roles?.includes('Teacher')) router.push('/login');
        }
    }, [user, loading, router]);

    const fetchSubmissions = async () => {
        try {
            setLoadingData(true);
            const res = await api.get(`/teacher/assignments/${assignmentId}/submissions`);
            setSubmissions(res.data || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load submissions');
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (user?.roles?.includes('Teacher') && assignmentId) {
            fetchSubmissions();
        }
    }, [user, assignmentId]);

    const openGradeModal = (submission: SubmissionItem) => {
        setGradingId(submission.id);
        setGradeForm({
            marks: submission.marksObtained || 0,
            feedback: submission.feedback || '',
            status: submission.status || 'Graded',
        });
    };

    const handleGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gradingId) return;

        setError('');
        setSuccess('');

        try {
            await api.put(`/teacher/submissions/${gradingId}/grade`, gradeForm);
            setSuccess('Submission graded successfully');
            setGradingId(null);
            fetchSubmissions();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to grade submission');
        }
    };

    if (loading || !user) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Submissions</h1>
                    <Link href="/teacher" className="text-blue-600 hover:underline text-sm">
                        ← Back to Dashboard
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg">{error}</div>
                )}
                {success && (
                    <div className="mb-4 bg-green-100 text-green-700 px-4 py-3 rounded-lg">{success}</div>
                )}

                <div className="bg-white rounded-xl shadow overflow-hidden">
                    {loadingData ? (
                        <div className="p-8 text-center text-gray-500">Loading submissions...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Student</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Email</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Answer</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Submitted</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Marks</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                                No submissions yet
                                            </td>
                                        </tr>
                                    ) : (
                                        submissions.map((item) => (
                                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium">{item.studentName}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{item.studentEmail}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                    {item.answer}
                                                </td>
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
                                                <td className="px-6 py-4 text-sm">
                                                    {item.marksObtained ?? '—'}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <button
                                                        onClick={() => openGradeModal(item)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        Grade
                                                    </button>
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

            {/* Grade Modal */}
            {gradingId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-lg font-bold mb-4">Grade Submission</h2>
                        <form onSubmit={handleGrade} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Marks *</label>
                                <input
                                    type="number"
                                    required
                                    min={0}
                                    value={gradeForm.marks}
                                    onChange={(e) =>
                                        setGradeForm({ ...gradeForm, marks: Number(e.target.value) })
                                    }
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Feedback</label>
                                <textarea
                                    value={gradeForm.feedback}
                                    onChange={(e) =>
                                        setGradeForm({ ...gradeForm, feedback: e.target.value })
                                    }
                                    rows={3}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select
                                    value={gradeForm.status}
                                    onChange={(e) =>
                                        setGradeForm({ ...gradeForm, status: e.target.value })
                                    }
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="Graded">Graded</option>
                                    <option value="Returned">Returned</option>
                                    <option value="Submitted">Submitted</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setGradingId(null)}
                                    className="flex-1 border rounded-lg py-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2"
                                >
                                    Save Grade
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}