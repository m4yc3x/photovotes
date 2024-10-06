import { useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLogin from '../../components/AdminLogin';

export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('adminAuthenticated');
        if (isAuthenticated === 'true') {
            router.push('/admin/dashboard');
        }
    }, [router]);

    return <AdminLogin />;
}