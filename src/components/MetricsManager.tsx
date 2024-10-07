import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Save, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Metric {
    id: number;
    name: string;
    scale: number;
}

export default function MetricsManager() {
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [newMetric, setNewMetric] = useState({ name: '', scale: 10 });
    const [editingMetric, setEditingMetric] = useState<Metric | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMetrics = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/metrics');
            if (!response.ok) {
                throw new Error('Failed to fetch metrics');
            }
            const data = await response.json();
            setMetrics(data);
        } catch (error) {
            console.error('Error fetching metrics:', error);
            setError('Failed to fetch metrics. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    const handleAddMetric = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await fetch('/api/metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMetric),
            });
            if (!response.ok) {
                throw new Error('Failed to add metric');
            }
            setNewMetric({ name: '', scale: 10 });
            fetchMetrics();
        } catch (error) {
            console.error('Error adding metric:', error);
            setError('Failed to add metric. Please try again.');
        }
    };

    const handleUpdateMetric = async (id: number, updatedMetric: Partial<Metric>) => {
        const response = await fetch(`/api/metrics?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedMetric),
        });
        if (response.ok) {
            setEditingMetric(null);
            fetchMetrics();
        }
    };

    const handleDeleteMetric = async (id: number) => {
        setError(null);
        try {
            const response = await fetch(`/api/metrics?id=${id}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Failed to delete metric');
            }
            fetchMetrics();
        } catch (error) {
            console.error('Error deleting metric:', error);
            setError('Failed to delete metric. Please try again.');
        }
    };

    const MetricSkeleton = () => (
        <div className="card bg-base-100 shadow-xl animate-pulse">
            <div className="card-body">
                <div className="h-4 bg-base-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-base-300 rounded w-1/4 mb-2"></div>
                <div className="card-actions justify-end">
                    <div className="h-8 bg-base-300 rounded w-20 mr-2"></div>
                    <div className="h-8 bg-base-300 rounded w-20"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-base-200 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Metrics Manager</h1>
                    <Link href="/admin/dashboard" className="btn btn-ghost">
                        <ArrowLeft className="mr-2" /> Back to Dashboard
                    </Link>
                </div>
                <div className="card bg-base-100 shadow-xl mb-8">
                    <div className="card-body">
                        <h2 className="card-title text-2xl mb-4"><Plus className="mr-2" /> Add New Metric</h2>
                        <form onSubmit={handleAddMetric} className="flex flex-col gap-4">
                            <input
                                type="text"
                                value={newMetric.name}
                                onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
                                placeholder="Metric Name"
                                className="input input-bordered w-full"
                            />
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={newMetric.scale}
                                    onChange={(e) => setNewMetric({ ...newMetric, scale: parseInt(e.target.value) })}
                                    className="range range-primary flex-grow"
                                />
                                <span className="w-12 text-center">{newMetric.scale}</span>
                            </div>
                            <button type="submit" className="btn btn-primary">
                                <Plus className="mr-2" /> Add Metric
                            </button>
                        </form>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error shadow-lg mb-4">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading
                        ? Array.from({ length: 6 }).map((_, index) => (
                            <MetricSkeleton key={index} />
                        ))
                        : metrics.map((metric) => (
                            <div key={metric.id} className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    {editingMetric?.id === metric.id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editingMetric.name}
                                                onChange={(e) => setEditingMetric({ ...editingMetric, name: e.target.value })}
                                                className="input input-bordered w-full mb-2"
                                            />
                                            <div className="flex items-center gap-4 mb-4">
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="10"
                                                    value={editingMetric.scale}
                                                    onChange={(e) => setEditingMetric({ ...editingMetric, scale: parseInt(e.target.value) })}
                                                    className="range range-primary flex-grow"
                                                />
                                                <span className="w-12 text-center">{editingMetric.scale}</span>
                                            </div>
                                            <div className="card-actions justify-end">
                                                <button
                                                    onClick={() => handleUpdateMetric(metric.id, editingMetric)}
                                                    className="btn btn-success btn-sm w-full"
                                                >
                                                    <Save className="mr-2" /> Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingMetric(null)}
                                                    className="btn btn-ghost btn-sm w-full"
                                                >
                                                    <X className="mr-2" /> Cancel
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h2 className="card-title">{metric.name}</h2>
                                            <p>Scale: 0-{metric.scale}</p>
                                            <div className="card-actions justify-end">
                                                <button
                                                    onClick={() => setEditingMetric(metric)}
                                                    className="btn btn-primary btn-sm w-full"
                                                >
                                                    <Edit2 className="mr-2" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMetric(metric.id)}
                                                    className="btn btn-error btn-sm w-full"
                                                >
                                                    <Trash2 className="mr-2" /> Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}