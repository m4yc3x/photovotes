import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Lock, LogIn, AlertTriangle } from 'lucide-react';

const ADMIN_PASSWORD = 'password';
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [lockoutTime, setLockoutTime] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const storedAttempts = parseInt(localStorage.getItem('loginAttempts') || '0');
        const storedLockoutTime = parseInt(localStorage.getItem('lockoutTime') || '0');
        setAttempts(storedAttempts);
        setLockoutTime(storedLockoutTime);
    }, []);

    useEffect(() => {
        if (lockoutTime > Date.now()) {
            const timer = setInterval(() => {
                if (lockoutTime <= Date.now()) {
                    clearInterval(timer);
                    setLockoutTime(0);
                    setAttempts(0);
                    localStorage.setItem('loginAttempts', '0');
                    localStorage.setItem('lockoutTime', '0');
                }
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [lockoutTime]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (lockoutTime > Date.now()) {
            setError(`Too many attempts. Please try again in ${Math.ceil((lockoutTime - Date.now()) / 1000)} seconds.`);
            return;
        }
        if (password === ADMIN_PASSWORD) {
            localStorage.setItem('adminAuthenticated', 'true');
            localStorage.setItem('loginAttempts', '0');
            localStorage.setItem('lockoutTime', '0');
            router.push('/admin/dashboard');
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            localStorage.setItem('loginAttempts', newAttempts.toString());
            if (newAttempts >= MAX_ATTEMPTS) {
                const newLockoutTime = Date.now() + LOCKOUT_TIME;
                setLockoutTime(newLockoutTime);
                localStorage.setItem('lockoutTime', newLockoutTime.toString());
                setError(`Too many attempts. Please try again in ${LOCKOUT_TIME / 1000} seconds.`);
            } else {
                setError(`Incorrect password. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-base-300">
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl font-bold mb-4 flex items-center">
                        <Lock className="mr-2" /> Admin Login
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-control">
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="input input-bordered w-full pr-10"
                                    disabled={lockoutTime > Date.now()}
                                />
                                <Lock className="absolute top-1/2 transform -translate-y-1/2 right-3 text-gray-400" size={20} />
                            </div>
                        </div>
                        <div className="form-control mt-6">
                            <button type="submit" className="btn btn-primary" disabled={lockoutTime > Date.now()}>
                                <LogIn className="mr-2" size={20} /> Login
                            </button>
                        </div>
                    </form>
                    {error && (
                        <p className="text-error mt-2 flex items-center">
                            <AlertTriangle className="mr-2" size={16} /> {error}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}