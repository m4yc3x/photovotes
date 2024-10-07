import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Image, Star } from 'lucide-react';
import Link from 'next/link';

interface Photo {
    id: number;
    username: string;
    imageUrl: string;
}

interface Metric {
    id: number;
    name: string;
    scale: number;  // Add this line to include the scale
}

interface Vote {
    photoId: number;
    metricId: number;
    value: number;
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
                const [photosData, metricsData, votesData] = await Promise.all([
                    photosRes.json(),
                    metricsRes.json(),
                    votesRes.json()
                ]);
                setPhotos(photosData);
                setMetrics(metricsData);
                setVotes(Array.isArray(votesData) ? votesData : []);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const photoResults = useMemo(() => {
        if (!Array.isArray(votes) || votes.length === 0) {
            return photos.map(photo => ({
                ...photo,
                metricScores: metrics.map(metric => ({ metricId: metric.id, score: 0 })),
                overallScore: 0
            }));
        }

        return photos.map(photo => {
            const photoVotes = votes.filter(vote => vote.photoId === photo.id);
            const metricScores = metrics.map(metric => {
                const metricVotes = photoVotes.filter(vote => vote.metricId === metric.id);
                const averageScore = metricVotes.length > 0
                    ? metricVotes.reduce((sum, vote) => sum + vote.value, 0) / metricVotes.length
                    : 0;
                return { metricId: metric.id, score: averageScore };
            });
            const overallScore = metricScores.reduce((sum, score) => sum + score.score, 0) / metrics.length;
            return { ...photo, metricScores, overallScore };
        }).sort((a, b) => b.overallScore - a.overallScore);
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
                                    <th key={metric.id}>{metric.name}</th>
                                ))}
                                <th>Overall Score</th>
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
                                    {photo.metricScores.map(score => (
                                        <td key={score.metricId} className="text-center">
                                            {score.score.toFixed(2)}
                                        </td>
                                    ))}
                                    <td className="font-bold">
                                        <div className="flex items-center">
                                            <Star className="text-yellow-400 mr-1" />
                                            {photo.overallScore.toFixed(2)}
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