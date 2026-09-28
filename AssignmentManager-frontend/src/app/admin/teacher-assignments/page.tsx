'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface TeacherAssignmentItem {
    id: string;
    teacherName: string;
    className: string;
    subjectName: string;
    assignedAt: string;
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

interface SubjectOption {
    id: string;
    name: string;
}

export default function AdminTeacherAssignmentsPage() {
    const [assignments, setAssignments] = useState<TeacherAssignmentItem[]>([]);
    const [teachers, setTeachers] = useState<UserOption[]>([]);
    const [classes, setClasses] = useState<ClassOption[]>([]);
    const [subjects, setSubjects] = useState<SubjectOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        teacherId: '',
        classId: '',
        subjectId: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [assignmentsRes, usersRes, classesRes, subjectsRes] = await Promise.all([
                api.get('/admin/teacher-assignments'),
                api.get('/admin/users?pageNumber=1&pageSize=100'),
                api.get('/admin/classes?pageNumber=1&pageSize=100'),
                api.get('/admin/subjects?pageNumber=1&pageSize=100'),
            ]);

            setAssignments(assignmentsRes.data || []);
            const allUsers = usersRes.data.items || [];
            setTeachers(allUsers.filter((u: any) => u.roles?.includes('Teacher')));
            setClasses(classesRes.data.items || []);
            setSubjects(subjectsRes.data.items || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.teacherId || !formData.classId || !formData.subjectId) {
            setError('Please select Teacher, Class and Subject');
            return;
        }

        try {
            await api.post('/admin/teacher-assignments', formData);
            setSuccess('Teacher assigned successfully');
            setShowModal(false);
            setFormData({ teacherId: '', classId: '', subjectId: '' });
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to assign teacher');
        }
    };

    return (
        <div>
            <header className="bg-white shadow">
                <div className="px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Assign Teachers</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        + Assign Teacher
                    </button>
                </div>
            </header>

            <main className="p-8">
                {error && <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
                {success && <div className="mb-4 bg-green-100 text-green-700 px-4 py-3 rounded-lg">{success}</div>}

                <div className="bg-white rounded-xl shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Teacher</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Class</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Subject</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Assigned At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            No teacher assignments found
                                        </td>
                                    </tr>
                                ) : (
                                    assignments.map((item) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium">{item.teacherName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{item.className}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{item.subjectName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(item.assignedAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-lg font-bold mb-4">Assign Teacher to Class + Subject</h2>
                        <form onSubmit={handleAssign} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Teacher *</label>
                                <select
                                    required
                                    value={formData.teacherId}
                                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="">-- Select Teacher --</option>
                                    {teachers.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.fullName} ({t.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Class *</label>
                                <select
                                    required
                                    value={formData.classId}
                                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="">-- Select Class --</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Subject *</label>
                                <select
                                    required
                                    value={formData.subjectId}
                                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="">-- Select Subject --</option>
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 border rounded-lg py-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2"
                                >
                                    Assign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}