import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { LogOut, Camera, User, Maximize2, Loader } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Photo } from '../models/Photo';
import { Metric } from '../models/Metric';

export default function JudgeDashboard() {
    const [username, setUsername] = useState<string | null>(null);
    const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null);
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [votes, setVotes] = useState<{ [key: number]: number }>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [expandedImage, setExpandedImage] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const router = useRouter();

    const fetchNextPhoto = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/photos/next', {
                headers: {
                    'user-id': userId?.toString() || ''
                }
            });
            if (response.ok) {
                const photo = await response.json();
                setCurrentPhoto(photo);
            } else if (response.status === 404) {
                setCurrentPhoto(null);
            } else {
                throw new Error('Failed to fetch next photo');
            }
        } catch (error) {
            console.error('Error fetching next photo:', error);
            setCurrentPhoto(null);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const fetchMetrics = useCallback(async () => {
        try {
            const response = await fetch('/api/metrics');
            if (response.ok) {
                const fetchedMetrics = await response.json();
                setMetrics(fetchedMetrics);
                setVotes(Object.fromEntries(fetchedMetrics.map(m => [m.id, 0])));
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
        fetchNextPhoto();
    }, [router, fetchMetrics, fetchNextPhoto]);

    const handleLogout = () => {
        localStorage.removeItem('userAuthenticated');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        router.push('/');
    };

    const handleVoteChange = (metricId: number, value: number) => {
        setVotes(prev => ({ ...prev, [metricId]: value }));
    };

    const handleSubmitVotes = async () => {
        setSubmitting(true);
        try {
            const response = await fetch('/api/votes', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'User-ID': userId?.toString() || '' // Add this line
                },
                body: JSON.stringify({
                    photoId: currentPhoto?.id,
                    votes: Object.entries(votes).map(([metricId, value]) => ({
                        metricId: parseInt(metricId),
                        value
                    }))
                }),
            });

            if (response.ok) {
                // Reset votes and fetch next photo
                setVotes(Object.fromEntries(metrics.map(m => [m.id, 0])));
                fetchNextPhoto();
            } else {
                console.error('Failed to submit votes');
            }
        } catch (error) {
            console.error('Error submitting votes:', error);
        } finally {
            setSubmitting(false);
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
                <h1 className="text-3xl font-bold mb-6">Welcome, {username}!</h1>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader className="animate-spin h-8 w-8 text-primary" />
                    </div>
                ) : currentPhoto ? (
                    <div className="card bg-base-100 shadow-xl">
                        <figure className="relative pt-[56.25%]">
                            {imageError ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
                                    Image failed to load
                                </div>
                            ) : (
                                <Image
                                    src={currentPhoto.imageUrl}
                                    alt={`Photo by ${currentPhoto.username}`}
                                    layout="fill"
                                    objectFit="contain"
                                    className="cursor-pointer"
                                    onClick={() => setExpandedImage(true)}
                                    onError={() => setImageError(true)}
                                />
                            )}
                            <button 
                                className="absolute top-2 right-2 btn btn-circle btn-sm"
                                onClick={() => setExpandedImage(true)}
                            >
                                <Maximize2 size={16} />
                            </button>
                        </figure>
                        <div className="card-body">
                            <h2 className="card-title">Photo by {currentPhoto.username}</h2>
                            <div className="space-y-4">
                                {metrics.map(metric => (
                                    <div key={metric.id} className="form-control">
                                        <label className="label">
                                            <span className="label-text">{metric.name}</span>
                                            <span className="label-text-alt">{votes[metric.id]} / {metric.scale}</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max={metric.scale}
                                            value={votes[metric.id]}
                                            onChange={(e) => handleVoteChange(metric.id, parseInt(e.target.value))}
                                            className="range range-primary"
                                        />
                                        <div className="w-full flex justify-between text-xs px-2">
                                            {Array.from({ length: metric.scale + 1 }, (_, i) => (
                                                <span key={i}>{i}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="card-actions justify-end mt-4">
                                <button 
                                    className={`btn btn-primary ${submitting ? 'loading' : ''}`}
                                    onClick={handleSubmitVotes}
                                    disabled={submitting}
                                >
                                    {submitting ? <Loader className="animate-spin mr-2" /> : null}
                                    Submit Votes
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <h2 className="text-2xl font-semibold mb-4">No more photos to judge!</h2>
                        <p>Great job! You've reviewed all available photos.</p>
                    </div>
                )}
            </main>

            {expandedImage && currentPhoto && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 cursor-pointer" 
                    onClick={() => setExpandedImage(false)}
                >
                    <div className="relative w-full h-full p-4">
                        <Image
                            src={currentPhoto.imageUrl}
                            alt={`Photo by ${currentPhoto.username}`}
                            layout="fill"
                            objectFit="contain"
                            quality={100}
                        />
                        <button 
                            className="absolute top-4 right-4 btn btn-circle btn-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpandedImage(false);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}