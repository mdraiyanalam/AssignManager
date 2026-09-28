'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    deadline: z.string().min(1, 'Deadline is required'),
    maxMarks: z.number().min(1, 'Max marks must be at least 1'),
    isPublished: z.boolean(),
    classId: z.string().min(1, 'Class is required'),
    subjectId: z.string().min(1, 'Subject is required'),
});

type FormData = z.infer<typeof schema>;

export default function CreateAssignmentPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [loadingOptions, setLoadingOptions] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: '',
            description: '',
            deadline: '',
            maxMarks: 20,
            isPublished: false,
            classId: '',
            subjectId: '',
        },
    });

    useEffect(() => {
        if (!loading) {
            if (!user) router.push('/login');
            else if (!user.roles?.includes('Teacher')) router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setLoadingOptions(true);
                const [classesRes, subjectsRes] = await Promise.all([
                    api.get('/teacher/classes'),
                    api.get('/teacher/subjects'),
                ]);
                setClasses(classesRes.data.items || classesRes.data || []);
                setSubjects(subjectsRes.data.items || subjectsRes.data || []);
            } catch (err) {
                console.error(err);
                setError('Failed to load classes/subjects. Make sure Teacher endpoints exist.');
            } finally {
                setLoadingOptions(false);
            }
        };

        if (user) fetchOptions();
    }, [user]);

    const onSubmit = async (data: FormData) => {
        setError('');
        try {
            await api.post('/teacher/assignments', {
                ...data,
                deadline: new Date(data.deadline).toISOString(),
            });
            router.push('/teacher');
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to create assignment');
        }
    };

    if (loading || !user) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Create Assignment</h1>
                    <Link href="/teacher" className="text-blue-600 hover:underline text-sm">
                        ← Back to Dashboard
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg">{error}</div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title *</label>
                        <input
                            {...register('title')}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            {...register('description')}
                            rows={4}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Deadline *</label>
                            <input
                                type="datetime-local"
                                {...register('deadline')}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.deadline && (
                                <p className="text-red-500 text-sm mt-1">{errors.deadline.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Max Marks *</label>
                            <input
                                type="number"
                                {...register('maxMarks', { valueAsNumber: true })}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.maxMarks && (
                                <p className="text-red-500 text-sm mt-1">{errors.maxMarks.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Class *</label>
                            <select
                                {...register('classId')}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={loadingOptions}
                            >
                                <option value="">-- Select Class --</option>
                                {classes.map((c) => (
                                    <option key={c.id || c.Id} value={c.id || c.Id}>
                                        {c.name || c.Name}
                                    </option>
                                ))}
                            </select>
                            {errors.classId && (
                                <p className="text-red-500 text-sm mt-1">{errors.classId.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Subject *</label>
                            <select
                                {...register('subjectId')}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={loadingOptions}
                            >
                                <option value="">-- Select Subject --</option>
                                {subjects.map((s) => (
                                    <option key={s.id || s.Id} value={s.id || s.Id}>
                                        {s.name || s.Name}
                                    </option>
                                ))}
                            </select>
                            {errors.subjectId && (
                                <p className="text-red-500 text-sm mt-1">{errors.subjectId.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="isPublished" {...register('isPublished')} />
                        <label htmlFor="isPublished" className="text-sm">
                            Publish immediately
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
                            disabled={isSubmitting}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Assignment'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}