'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface AppSetting {
    id?: string;
    key: string;
    value: string;
    description?: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<AppSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        key: '',
        value: '',
        description: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/settings');
            setSettings(res.data || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await api.post('/admin/settings', formData);
            setSuccess('Setting saved successfully');
            setShowModal(false);
            setFormData({ key: '', value: '', description: '' });
            fetchSettings();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save setting');
        }
    };

    return (
        <div>
            <header className="bg-white shadow">
                <div className="px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Application Settings</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        + Add / Update Setting
                    </button>
                </div>
            </header>

            <main className="p-8">
                {error && <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
                {success && <div className="mb-4 bg-green-100 text-green-700 px-4 py-3 rounded-lg">{success}</div>}

                <div className="bg-white rounded-xl shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading settings...</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Key</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Value</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {settings.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                            No settings found
                                        </td>
                                    </tr>
                                ) : (
                                    settings.map((item) => (
                                        <tr key={item.key} className="border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium">{item.key}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{item.value}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{item.description || '—'}</td>
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
                        <h2 className="text-lg font-bold mb-4">Add / Update Setting</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Key *</label>
                                <input
                                    required
                                    value={formData.key}
                                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                    placeholder="e.g. MaxFileSizeMB"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Value *</label>
                                <input
                                    required
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border rounded-lg py-2">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 bg-gray-800 hover:bg-gray-900 text-white rounded-lg py-2">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}