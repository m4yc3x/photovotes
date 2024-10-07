import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Star, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

interface Photo {
    id: number;
    username: string;
    imageUrl: string;
}

interface Metric {
    id: number;
    name: string;
    scale: number;
}

interface Vote {
    id: number;
    value: number;
    user: { id: number };
    metric: { id: number };
    photo: { id: number };
}

export default function AdminResults() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [votes, setVotes] = useState<Vote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [photosRes, metricsRes, votesRes] = await Promise.all([
                    fetch('/api/photos'),
                    fetch('/api/metrics'),
                    fetch('/api/votes')
                ]);

                if (!photosRes.ok || !metricsRes.ok || !votesRes.ok) {
                    throw new Error('One or more API requests failed');
                }

                const [photosData, metricsData, votesData] = await Promise.all([
                    photosRes.json(),
                    metricsRes.json(),
                    votesRes.json()
                ]);

                setPhotos(photosData);
                setMetrics(metricsData);
                setVotes(votesData);

                console.log('Fetched data:', { photos: photosData, metrics: metricsData, votes: votesData });
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error instanceof Error ? error.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const photoResults = useMemo(() => {
        return photos.map(photo => {
            const photoVotes = votes.filter(vote => vote.photo.id === photo.id);

            const metricAverages = metrics.map(metric => {
                const metricVotes = photoVotes.filter(vote => vote.metric.id === metric.id);
                const totalValue = metricVotes.reduce((sum, vote) => sum + vote.value, 0);
                const averageValue = metricVotes.length > 0 ? totalValue / metricVotes.length : 0;
                return { metricId: metric.id, average: averageValue };
            });

            const totalScore = metricAverages.reduce((sum, metric) => sum + metric.average, 0);
            const overallAverage = totalScore / metrics.length;

            return { ...photo, metricAverages, totalScore, overallAverage };
        }).sort((a, b) => b.totalScore - a.totalScore);
    }, [photos, metrics, votes]);

    if (loading) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg"></div>
                    <p className="mt-4 text-xl">Loading results...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-error">{error}</p>
                    <button onClick={() => window.location.reload()} className="btn btn-primary mt-4">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Photo Voting Results</h1>
                    <Link href="/admin/dashboard" className="btn btn-ghost">
                        <ArrowLeft className="mr-2" /> Back to Dashboard
                    </Link>
                </div>

                <div className="card bg-base-100 shadow-xl overflow-x-auto">
                    <table className="table table-zebra w-full">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Photo</th>
                                <th>Username</th>
                                {metrics.map(metric => (
                                    <th key={metric.id}>{metric.name} (0-{metric.scale})</th>
                                ))}
                                <th>Total Score</th>
                                <th>Overall Average</th>
                            </tr>
                        </thead>
                        <tbody>
                            {photoResults.map((photo, index) => (
                                <tr key={photo.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-12 h-12">
                                                <img src={photo.imageUrl} alt={`Photo by ${photo.username}`} />
                                            </div>
                                        </div>
                                    </td>
                                    <td>{photo.username}</td>
                                    {photo.metricAverages.map(metricAvg => (
                                        <td key={metricAvg.metricId} className="text-center">
                                            {metricAvg.average.toFixed(2)}
                                        </td>
                                    ))}
                                    <td className="font-bold text-center">
                                        <div className="flex items-center justify-center">
                                            <BadgeCheck className="text-green-400 mr-1" />
                                            {photo.totalScore.toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="font-bold">
                                        <div className="flex items-center justify-center">
                                            <Star className="text-yellow-400 mr-1" />
                                            {photo.overallAverage.toFixed(2)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}