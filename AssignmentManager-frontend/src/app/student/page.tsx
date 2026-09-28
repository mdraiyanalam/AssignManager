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
    className: string;
    subjectName: string;
    teacherName: string;
}

interface SubmissionItem {
    id: string;
    answer: string;
    submittedAt: string;
    marksObtained?: number;
    feedback?: string;
    status: string;
    assignmentTitle: string;
    maxMarks: number;
}

export default function StudentDashboardPage() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();

    const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
    const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem | null>(null);
    const [answer, setAnswer] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) router.push('/login');
            else if (!user.roles?.includes('Student')) router.push('/login');
        }
    }, [user, loading, router]);

    const fetchData = async () => {
        try {
            setLoadingData(true);
            setError('');
            const [assignmentsRes, submissionsRes] = await Promise.all([
                api.get('/student/assignments?pageNumber=1&pageSize=50'),
                api.get('/student/submissions'),
            ]);
            setAssignments(assignmentsRes.data.items || []);
            setSubmissions(submissionsRes.data || []);
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401) {
                setError('Session expired. Please login again.');
            } else {
                setError('Failed to load data');
            }
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (user?.roles?.includes('Student')) {
            fetchData();
        }
    }, [user]);

    const hasSubmitted = (title: string) =>
        submissions.some((s) => s.assignmentTitle === title);

    const handleOpenSubmit = (assignment: AssignmentItem) => {
        setError('');
        setSuccess('');
        setSelectedAssignment(assignment);
        const existing = submissions.find((s) => s.assignmentTitle === assignment.title);
        setAnswer(existing?.answer || '');
        setShowSubmitModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssignment) return;

        setError('');
        setSuccess('');
        setSubmitting(true);

        console.log('Submitting assignmentId:', selectedAssignment.id);
        console.log('Answer:', answer);

        try {
            const res = await api.post('/student/submissions', {
                assignmentId: selectedAssignment.id,
                answer: answer,
            });
            console.log('Submit success:', res.data);

            setSuccess(
                hasSubmitted(selectedAssignment.title)
                    ? 'Submission updated successfully'
                    : 'Submission saved successfully'
            );
            setShowSubmitModal(false);
            setAnswer('');
            fetchData();
        } catch (err: any) {
            console.error('Submit error full:', err);
            console.error('Response data:', err.response?.data);

            const msg =
                err.response?.data?.message ||
                err.response?.data?.title ||
                (typeof err.response?.data === 'string' ? err.response.data : null) ||
                'Failed to submit assignment';

            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const gradedCount = submissions.filter((s) => s.status === 'Graded').length;

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
                    <h1 className="text-xl font-bold text-gray-800">Student Dashboard</h1>
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
                {error && !showSubmitModal && (
                    <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg">{error}</div>
                )}
                {success && (
                    <div className="mb-4 bg-green-100 text-green-700 px-4 py-3 rounded-lg">{success}</div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="text-gray-500 text-sm">Available Assignments</h3>
                        <p className="text-3xl font-bold mt-2 text-blue-600">
                            {loadingData ? '...' : assignments.length}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="text-gray-500 text-sm">Submitted</h3>
                        <p className="text-3xl font-bold mt-2 text-green-600">
                            {loadingData ? '...' : submissions.length}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="text-gray-500 text-sm">Graded</h3>
                        <p className="text-3xl font-bold mt-2 text-purple-600">
                            {loadingData ? '...' : gradedCount}
                        </p>
                    </div>
                </div>

                {/* Available Assignments */}
                <div className="bg-white rounded-xl shadow overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-lg font-semibold">Available Assignments</h2>
                    </div>
                    {loadingData ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Title</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Teacher</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Class</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Deadline</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Marks</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                No assignments available for your classes
                                            </td>
                                        </tr>
                                    ) : (
                                        assignments.map((item) => (
                                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium">{item.title}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{item.teacherName}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{item.className}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {new Date(item.deadline).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{item.maxMarks}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <button
                                                        onClick={() => handleOpenSubmit(item)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                                                    >
                                                        {hasSubmitted(item.title) ? 'Update Submission' : 'Submit'}
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

                {/* Grades */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-lg font-semibold">My Submissions & Grades</h2>
                    </div>
                    {loadingData ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
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
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                You have not submitted any assignments yet
                                            </td>
                                        </tr>
                                    ) : (
                                        submissions.map((item) => (
                                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium">{item.assignmentTitle}</td>
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
                                                <td className="px-6 py-4 text-sm font-medium">
                                                    {item.marksObtained != null
                                                        ? `${item.marksObtained} / ${item.maxMarks}`
                                                        : '—'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
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
            </main>

            {/* Submit Modal */}
            {showSubmitModal && selectedAssignment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                        <h2 className="text-lg font-bold mb-2">
                            {hasSubmitted(selectedAssignment.title) ? 'Update Submission' : 'Submit Assignment'}
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">
                            <strong>{selectedAssignment.title}</strong> — Max Marks:{' '}
                            {selectedAssignment.maxMarks}
                        </p>

                        {error && (
                            <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {typeof error === 'string' ? error : JSON.stringify(error)}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Your Answer *</label>
                                <textarea
                                    required
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    rows={6}
                                    className="w-full border rounded-lg px-3 py-2"
                                    placeholder="Write your answer here..."
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSubmitModal(false);
                                        setError('');
                                    }}
                                    className="flex-1 border rounded-lg py-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 disabled:opacity-50"
                                >
                                    {submitting
                                        ? 'Submitting...'
                                        : hasSubmitted(selectedAssignment.title)
                                            ? 'Update'
                                            : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}