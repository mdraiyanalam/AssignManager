'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<any>(null);
    const [form, setForm] = useState({ fullName: '', phone: '', email: '' });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/profile');
                const data = res.data;
                setProfile(data);
                setForm({
                    fullName: data.fullName || data.FullName || '',
                    phone: data.phone || data.Phone || '',
                    email: data.email || data.Email || '',
                });
            } catch (err) {
                setError('Failed to load profile');
            }
        };
        if (user) load();
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setSaving(true);
        try {
            await api.put('/profile', form);
            setMessage('Profile updated successfully');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setSaving(true);
        try {
            await api.put('/profile/password', passwordForm);
            setMessage('Password changed successfully');
            setPasswordForm({ currentPassword: '', newPassword: '' });
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data || 'Password change failed');
        } finally {
            setSaving(false);
        }
    };

    const backLink =
        user?.roles?.includes('Admin')
            ? '/admin'
            : user?.roles?.includes('Teacher')
                ? '/teacher'
                : '/student';

    if (loading || !user) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold">My Profile</h1>
                    <div className="flex gap-3">
                        <Link href={backLink} className="text-blue-600 text-sm hover:underline">
                            ← Dashboard
                        </Link>
                        <button onClick={logout} className="text-red-600 text-sm">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
                {message && <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg">{message}</div>}

                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Role: {(profile?.roles || profile?.Roles || user.roles || []).join(', ')}
                    </p>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Full Name</label>
                            <input
                                className="w-full border rounded-lg px-3 py-2"
                                value={form.fullName}
                                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full border rounded-lg px-3 py-2"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone</label>
                            <input
                                className="w-full border rounded-lg px-3 py-2"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                        >
                            Save Profile
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Current Password</label>
                            <input
                                type="password"
                                required
                                className="w-full border rounded-lg px-3 py-2"
                                value={passwordForm.currentPassword}
                                onChange={(e) =>
                                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">New Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                className="w-full border rounded-lg px-3 py-2"
                                value={passwordForm.newPassword}
                                onChange={(e) =>
                                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                                }
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                        >
                            Change Password
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}