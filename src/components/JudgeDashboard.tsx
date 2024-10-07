import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { LogOut, Camera, User } from 'lucide-react';
import Link from 'next/link';

export default function JudgeDashboard() {
    const [username, setUsername] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const userAuthenticated = localStorage.getItem('userAuthenticated') === 'true';
        const userRole = localStorage.getItem('userRole');
        
        if (!userAuthenticated || userRole !== 'judge') {
            router.push('/');
        }

        // Retrieve the username from localStorage or any other source
        const storedUsername = localStorage.getItem('username');
        setUsername(storedUsername);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('userAuthenticated');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-base-200">
            <header className="navbar bg-base-100 shadow-lg">
                <div className="flex-1">
                    <Link href="/judge/dashboard" className="btn btn-ghost normal-case text-xl">
                        <Camera className="mr-2" />
                        PhotoVotes Judge
                    </Link>
                </div>
                <div className="flex-none gap-2">
                    <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full">
                                <User className="w-6 h-6 m-2" />
                            </div>
                        </label>
                        <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                            <li>
                                <a className="justify-between">
                                    {username || 'Judge'}
                                    <span className="badge">Judge</span>
                                </a>
                            </li>
                            <li><a onClick={handleLogout}><LogOut className="mr-2" /> Logout</a></li>
                        </ul>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-6">Welcome, Judge!</h1>
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Photo Voting Area</h2>
                        <p>Photos will appear here for you to vote on.</p>
                        {/* Placeholder for future photo display and voting functionality */}
                        <div className="bg-base-200 h-64 flex items-center justify-center rounded-lg">
                            <p className="text-xl text-base-content/50">Photos coming soon...</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}