import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminDashboard from '../../components/AdminDashboard';

export default function DashboardPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const authStatus = localStorage.getItem('adminAuthenticated');
        if (authStatus !== 'true') {
            router.push('/admin');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    if (!isAuthenticated) {
        return <div>Loading...</div>;
    }

    return <AdminDashboard />;
}