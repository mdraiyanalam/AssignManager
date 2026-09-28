'use client';

import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Navbar */}
            <header className="bg-white/80 backdrop-blur border-b sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <span className="font-bold text-xl text-gray-800">AssignManager</span>
                    </div>
                    <Link
                        href="/login"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
                    >
                        Login
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <main className="max-w-6xl mx-auto px-4 py-16 md:py-24">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                        Assignment & Submission
                        <span className="text-blue-600"> Management System</span>
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                        A role-based school/college application that lets teachers create and grade
                        assignments, students submit work, and admins manage the entire system.
                        Built with Next.js, ASP.NET Core, and PostgreSQL.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/login"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium text-lg transition shadow-lg shadow-blue-200"
                        >
                            Get Started - Login
                        </Link>
                    </div>
                </div>

                {/* Roles */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                            <span className="text-blue-700 font-bold text-lg">AD</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Admin</h3>
                        <ul className="text-gray-600 text-sm space-y-1.5">
                            <li>- Manage users and roles</li>
                            <li>- Manage classes and subjects</li>
                            <li>- Assign teachers</li>
                            <li>- View all assignments</li>
                            <li>- Application settings</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                            <span className="text-green-700 font-bold text-lg">TR</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Teacher</h3>
                        <ul className="text-gray-600 text-sm space-y-1.5">
                            <li>- Create and publish assignments</li>
                            <li>- Set deadline and max marks</li>
                            <li>- View student submissions</li>
                            <li>- Grade and give feedback</li>
                            <li>- Update or delete assignments</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                            <span className="text-purple-700 font-bold text-lg">ST</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Student</h3>
                        <ul className="text-gray-600 text-sm space-y-1.5">
                            <li>- View class assignments</li>
                            <li>- Submit answers</li>
                            <li>- Update before deadline</li>
                            <li>- Track submission status</li>
                            <li>- View marks and feedback</li>
                        </ul>
                    </div>
                </div>

                {/* Tech Stack */}
                <div className="mt-16 text-center">
                    <p className="text-sm text-gray-500 mb-3">Built with</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {['Next.js', 'React', 'TypeScript', 'ASP.NET Core', 'C#', 'PostgreSQL', 'JWT', 'Tailwind CSS'].map(
                            (tech) => (
                                <span
                                    key={tech}
                                    className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                                >
                                    {tech}
                                </span>
                            )
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-white/60 mt-12">
                <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
                    <p>
                        Assignment & Submission Management System - Assistant Software Engineer
                        Recruitment Project
                    </p>
                    <p className="mt-1">Md Raiyan Alam</p>
                </div>
            </footer>
        </div>
    );
}