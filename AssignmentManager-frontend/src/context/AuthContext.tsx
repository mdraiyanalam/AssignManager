'use client';

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Restore user from cookie on page refresh
    useEffect(() => {
        const token = Cookies.get('token');
        const userData = Cookies.get('user');

        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch {
                Cookies.remove('token');
                Cookies.remove('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, user } = res.data;

        Cookies.set('token', token, { expires: 1 });
        Cookies.set('user', JSON.stringify(user), { expires: 1 });
        setUser(user);

        const role = user.roles?.[0];
        if (role === 'Admin') router.push('/admin');
        else if (role === 'Teacher') router.push('/teacher');
        else router.push('/student');
    };

    const logout = () => {
        Cookies.remove('token');
        Cookies.remove('user');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside an AuthProvider');
    }
    return context;
}