import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
    title: 'AssignManager - Assignment & Submission Management System',
    description: 'Role-based Assignment & Submission Management System',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="bg-gray-50 min-h-screen">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}