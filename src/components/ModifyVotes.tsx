import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { LogOut, Camera, User, ChevronLeft, ChevronRight, Save, Loader } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Photo } from '../models/Photo';
import { Metric } from '../models/Metric';

export default function ModifyVotes() {
    const [username, setUsername] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [votes, setVotes] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<number | null>(null);
    const router = useRouter();

    const photosPerPage = 12;

    const fetchPhotosAndVotes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/votes/user?userId=${userId}&page=${currentPage}&limit=${photosPerPage}`);
            if (response.ok) {
                const data = await response.json();
                setPhotos(data.photos);
                setVotes(data.votes);
                setTotalPages(Math.ceil(data.total / photosPerPage));
            } else {
                throw new Error('Failed to fetch photos and votes');
            }
        } catch (error) {
            console.error('Error fetching photos and votes:', error);
        } finally {
            setLoading(false);
        }
    }, [userId, currentPage]);

    const fetchMetrics = useCallback(async () => {
        try {
            const response = await fetch('/api/metrics');
            if (response.ok) {
                const fetchedMetrics = await response.json();
                setMetrics(fetchedMetrics);
            }
        } catch (error) {
            console.error('Error fetching metrics:', error);
        }
    }, []);

    useEffect(() => {
        const userAuthenticated = localStorage.getItem('userAuthenticated') === 'true';
        const userRole = localStorage.getItem('userRole');
        const storedUserId = localStorage.getItem('userId');

        if (!userAuthenticated || userRole !== 'judge') {
            router.push('/');
        }

        const storedUsername = localStorage.getItem('username');
        setUsername(storedUsername);
        setUserId(storedUserId ? parseInt(storedUserId) : null);

        fetchMetrics();
    }, [router, fetchMetrics]);

    useEffect(() => {
        if (userId) {
            fetchPhotosAndVotes();
        }
    }, [userId, currentPage, fetchPhotosAndVotes]);

    const handleLogout = () => {
        localStorage.removeItem('userAuthenticated');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        router.push('/');
    };

    const handleVoteChange = (photoId: number, metricId: number, value: number) => {
        setVotes(prev => ({ ...prev, [`${photoId}-${metricId}`]: value }));
    };

    const handleSaveVotes = async (photoId: number) => {
        setSaving(photoId);
        try {
            const photoVotes = Object.entries(votes)
                .filter(([key]) => key.startsWith(`${photoId}-`))
                .map(([key, value]) => ({
                    metricId: parseInt(key.split('-')[1]),
                    value
                }));

            const response = await fetch('/api/votes', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': userId?.toString() || ''
                },
                body: JSON.stringify({
                    photoId,
                    votes: photoVotes
                }),
            });

            if (response.ok) {
                console.log('Votes updated successfully');
                // Optionally, you can show a success message to the user here
            } else {
                throw new Error('Failed to update votes');
            }
        } catch (error) {
            console.error('Error updating votes:', error);
            // Optionally, you can show an error message to the user here
        } finally {
            setSaving(null);
        }
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
                    <Link href="/judge/dashboard" className="btn btn-ghost">Dashboard</Link>
                    <Link href="/judge/modify-votes" className="btn btn-ghost">Modify Votes</Link>
                    <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full">
                                <User className="w-6 h-6 m-2" />
                            </div>
                        </label>
                        <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 gap-2">
                            <li>
                                <a className="justify-between py-2">
                                    {username || 'Judge'}
                                    <span className="badge">Judge</span>
                                </a>
                            </li>
                            <li><a className="py-2" onClick={handleLogout}><LogOut className="mr-2" /> Logout</a></li>
                        </ul>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Modify Your Votes</h1>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader className="animate-spin h-8 w-8 text-primary" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {photos.map(photo => (
                                <div key={photo.id} className="card bg-base-100 shadow-xl">
                                    <figure className="relative pt-[100%]">
                                        <Image
                                            src={photo.imageUrl}
                                            alt={`Photo by ${photo.username}`}
                                            layout="fill"
                                            objectFit="cover"
                                        />
                                    </figure>
                                    <div className="card-body p-4">
                                        <h2 className="card-title text-sm">Photo by {photo.username}</h2>
                                        <div className="space-y-2">
                                            {metrics.map(metric => (
                                                <div key={metric.id} className="form-control">
                                                    <label className="label py-0">
                                                        <span className="label-text text-xs">{metric.name}</span>
                                                        <span className="label-text-alt text-xs">
                                                            {votes[`${photo.id}-${metric.id}`] || 0} / {metric.scale}
                                                        </span>
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max={metric.scale}
                                                        value={votes[`${photo.id}-${metric.id}`] || 0}
                                                        onChange={(e) => handleVoteChange(photo.id, metric.id, parseInt(e.target.value))}
                                                        className="range range-primary range-xs"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="card-actions justify-end mt-2">
                                            <button
                                                className={`btn btn-primary btn-xs ${saving === photo.id ? 'loading' : ''}`}
                                                onClick={() => handleSaveVotes(photo.id)}
                                                disabled={saving !== null}
                                            >
                                                {saving === photo.id ? <Loader className="animate-spin mr-1" size={12} /> : <Save className="mr-1" size={12} />}
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center items-center space-x-4 mt-6">
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={16} />
                                Previous
                            </button>
                            <span className="text-sm">Page {currentPage} of {totalPages}</span>
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
