'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface EnrollmentItem {
    id: string;
    studentName: string;
    studentEmail: string;
    className: string;
    enrolledAt: string;
}

interface UserOption {
    id: string;
    fullName: string;
    email: string;
    roles: string[];
}

interface ClassOption {
    id: string;
    name: string;
}

export default function AdminEnrollmentsPage() {
    const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
    const [students, setStudents] = useState<UserOption[]>([]);
    const [classes, setClasses] = useState<ClassOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        studentId: '',
        classId: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/enrollments');
            setEnrollments(res.data || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load enrollments');
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = async () => {
        try {
            const [usersRes, classesRes] = await Promise.all([
                api.get('/admin/users?pageNumber=1&pageSize=100'),
                api.get('/admin/classes?pageNumber=1&pageSize=100'),
            ]);

            const allUsers = usersRes.data.items || [];
            const studentUsers = allUsers.filter((u: any) =>
                u.roles?.includes('Student')
            );

            setStudents(studentUsers);
            setClasses(classesRes.data.items || []);
        } catch (err) {
            console.error('Failed to load options', err);
        }
    };

    useEffect(() => {
        fetchEnrollments();
        fetchOptions();
    }, []);

    const handleEnroll = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.studentId || !formData.classId) {
            setError('Please select both student and class');
            return;
        }

        try {
            await api.post('/admin/enrollments', formData);
            setSuccess('Student enrolled successfully');
            setShowModal(false);
            setFormData({ studentId: '', classId: '' });
            fetchEnrollments();
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.response?.data ||
                'Failed to enroll student'
            );
        }
    };

    return (
        <div>
            <header className="bg-white shadow">
                <div className="px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Student Enrollments</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        + Enroll Student
                    </button>
                </div>
            </header>

            <main className="p-8">
                {error && (
                    <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 bg-green-100 text-green-700 px-4 py-3 rounded-lg">
                        {success}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">
                            Loading enrollments...
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                        Student Name
                                    </th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                        Email
                                    </th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                        Class
                                    </th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                        Enrolled At
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-8 text-center text-gray-500"
                                        >
                                            No enrollments found
                                        </td>
                                    </tr>
                                ) : (
                                    enrollments.map((item) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium">
                                                {item.studentName}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {item.studentEmail}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {item.className}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(item.enrolledAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {/* Enroll Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-lg font-bold mb-4">Enroll Student to Class</h2>
                        <form onSubmit={handleEnroll} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Select Student *
                                </label>
                                <select
                                    required
                                    value={formData.studentId}
                                    onChange={(e) =>
                                        setFormData({ ...formData, studentId: e.target.value })
                                    }
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">-- Select Student --</option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.fullName} ({s.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Select Class *
                                </label>
                                <select
                                    required
                                    value={formData.classId}
                                    onChange={(e) =>
                                        setFormData({ ...formData, classId: e.target.value })
                                    }
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">-- Select Class --</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
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
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg py-2"
                                >
                                    Enroll
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}