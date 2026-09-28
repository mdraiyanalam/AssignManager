'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface UserItem {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    isActive: boolean;
    createdAt: string;
    roles: string[];
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        roleName: 'Student',
    });

    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/users?pageNumber=${page}&pageSize=10`);
            const items = (res.data.items || []).map((u: any) => ({
                id: u.id || u.Id,
                email: u.email || u.Email,
                fullName: u.fullName || u.FullName,
                phone: u.phone || u.Phone,
                isActive: u.isActive ?? u.IsActive,
                createdAt: u.createdAt || u.CreatedAt,
                roles: u.roles || u.Roles || [],
            }));
            setUsers(items);
            setTotalPages(res.data.totalPages || 1);
            setPageNumber(res.data.pageNumber || 1);
        } catch (err) {
            console.error(err);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.post('/admin/users', formData);
            setSuccess('User created successfully');
            setShowModal(false);
            setFormData({
                email: '',
                password: '',
                fullName: '',
                phone: '',
                roleName: 'Student',
            });
            fetchUsers(pageNumber);
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to create user');
        }
    };

    const handleChangeRole = async (userId: string, roleName: string) => {
        try {
            await api.put(`/admin/users/${userId}/role`, { roleName });
            setSuccess(`Role changed to ${roleName}`);
            fetchUsers(pageNumber);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to change role');
        }
    };

    const handleDeactivate = async (userId: string) => {
        if (!confirm('Deactivate this user?')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            setSuccess('User deactivated');
            fetchUsers(pageNumber);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to deactivate');
        }
    };

    return (
        <div>
            <header className="bg-white shadow">
                <div className="px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Manage Users</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        + Create User
                    </button>
                </div>
            </header>

            <main className="p-8">
                {error && <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
                {success && <div className="mb-4 bg-green-100 text-green-700 px-4 py-3 rounded-lg">{success}</div>}

                <div className="bg-white rounded-xl shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading users...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Name</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Email</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Roles</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                No users found
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium">{user.fullName}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {(user.roles || []).join(', ')}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs ${user.isActive
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                            }`}
                                                    >
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex gap-2 items-center">
                                                        <select
                                                            defaultValue=""
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    handleChangeRole(user.id, e.target.value);
                                                                    e.target.value = '';
                                                                }
                                                            }}
                                                            className="border rounded px-2 py-1 text-sm"
                                                        >
                                                            <option value="">Change Role</option>
                                                            <option value="Admin">Admin</option>
                                                            <option value="Teacher">Teacher</option>
                                                            <option value="Student">Student</option>
                                                        </select>
                                                        {user.isActive && (
                                                            <button
                                                                onClick={() => handleDeactivate(user.id)}
                                                                className="text-red-600 hover:underline text-sm"
                                                            >
                                                                Deactivate
                                                            </button>
                                                        )}
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

                {totalPages > 1 && (
                    <div className="mt-4 flex justify-center gap-2">
                        <button
                            disabled={pageNumber <= 1}
                            onClick={() => fetchUsers(pageNumber - 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1">
                            Page {pageNumber} of {totalPages}
                        </span>
                        <button
                            disabled={pageNumber >= totalPages}
                            onClick={() => fetchUsers(pageNumber + 1)}
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
                        <h2 className="text-lg font-bold mb-4">Create New User</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name *</label>
                                <input
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Password *</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Role *</label>
                                <select
                                    value={formData.roleName}
                                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="Student">Student</option>
                                    <option value="Teacher">Teacher</option>
                                    <option value="Admin">Admin</option>
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
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2"
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