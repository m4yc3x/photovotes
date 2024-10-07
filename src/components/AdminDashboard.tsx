import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Photo } from '../models/Photo';
import { Search, LogOut, User, Plus, Trash2, Image, Users, Activity, Telescope } from 'lucide-react';
import Link from 'next/link';

const ITEMS_PER_PAGE = 9;

export default function AdminDashboard() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [newPhoto, setNewPhoto] = useState({ username: '', imageUrl: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchPhotos = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/photos');
            const data = await response.json();
            setPhotos(data);
        } catch (error) {
            console.error('Error fetching photos:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPhotos();
    }, [fetchPhotos]);

    const handleAddPhoto = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch('/api/photos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPhoto),
        });
        if (response.ok) {
            setNewPhoto({ username: '', imageUrl: '' });
            fetchPhotos();
        }
    };

    const handleDeletePhoto = async (id: number) => {
        const response = await fetch(`/api/photos?id=${id}`, { method: 'DELETE' });
        if (response.ok) fetchPhotos();
    };

    const filteredPhotos = useMemo(() => {
        return photos.filter(photo =>
            photo.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [photos, searchTerm]);

    const pageCount = Math.ceil(filteredPhotos.length / ITEMS_PER_PAGE);
    const paginatedPhotos = useMemo(() => {
        return filteredPhotos.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        );
    }, [filteredPhotos, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleLogout = () => {
        localStorage.removeItem('adminAuthenticated');
        router.push('/admin');
    };

    const PhotoSkeleton = () => (
        <div className="card bg-base-100 shadow-xl animate-pulse">
            <div className="h-48 bg-base-300"></div>
            <div className="card-body">
                <div className="h-4 bg-base-300 rounded w-3/4 mb-2"></div>
                <div className="card-actions justify-end">
                    <div className="h-8 bg-base-300 rounded w-20"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-base-300">
            <div className="navbar bg-base-100 shadow-lg">
                <div className="flex-1">
                    <a className="btn btn-ghost normal-case text-xl">
                        PhotoVotes Admin
                    </a>
                </div>
                <div className="flex-none gap-4">
                    <Link href="/admin/metrics" className="btn btn-ghost">
                        <Telescope className="mr-2" /> View Results
                    </Link>
                    <Link href="/admin/metrics" className="btn btn-ghost">
                        <Activity className="mr-2" /> Manage Metrics
                    </Link>
                    <Link href="/admin/users" className="btn btn-ghost">
                        <Users className="mr-2" /> Manage Users
                    </Link>
                    <div className="form-control">
                        <div className="input-group flex items-center gap-4">
                            <input
                                type="text"
                                placeholder="Search photos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input input-bordered"
                            />
                            <button className="btn btn-ghost">
                                <Search />
                            </button>
                        </div>
                    </div>
                    <div className="dropdown dropdown-end mr-2">
                        <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full">
                                <User className="w-6 h-6 m-2" />
                            </div>
                        </label>
                        <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                            <li><a onClick={handleLogout}><LogOut className="mr-2" /> Logout</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-[3fr,1fr] gap-6">
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title"><Plus className="mr-2" /> Add New Photo</h2>
                            <form onSubmit={handleAddPhoto} className="flex flex-col gap-4">
                                <div className="input-group flex items-center gap-4">
                                    <span><User /></span>
                                    <input
                                        type="text"
                                        value={newPhoto.username}
                                        onChange={(e) => setNewPhoto({ ...newPhoto, username: e.target.value })}
                                        placeholder="Username"
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div className="input-group flex items-center gap-4">
                                    <span><Image /></span>
                                    <input
                                        type="text"
                                        value={newPhoto.imageUrl}
                                        onChange={(e) => setNewPhoto({ ...newPhoto, imageUrl: e.target.value })}
                                        placeholder="Image URL"
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">
                                    <Plus className="mr-2" /> Add Photo
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body flex flex-col items-center justify-center">
                            <div className="flex flex-col items-center justify-center">
                                <p className="text-4xl font-bold">{photos.length}</p>
                                <p className="text-lg text-gray-500">Total Photos</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="divider">Photos</div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading
                        ? Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                              <PhotoSkeleton key={index} />
                          ))
                        : paginatedPhotos.map((photo) => (
                              <div key={photo.id} className="card bg-base-100 shadow-xl">
                                  <figure><img src={photo.imageUrl} alt={photo.username} className="w-full h-48 object-cover" /></figure>
                                  <div className="card-body">
                                      <h2 className="card-title line-clamp-1 text-ellipsis">{photo.username}</h2>
                                      <div className="card-actions justify-end">
                                          <button
                                              onClick={() => handleDeletePhoto(photo.id)}
                                              className="btn btn-error btn-sm"
                                          >
                                              <Trash2 className="mr-2" /> Delete
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          ))}
                </div>

                {pageCount > 1 && (
                    <div className="flex justify-center mt-8">
                        <div className="join">
                            {[...Array(pageCount)].map((_, index) => (
                                <button
                                    key={index}
                                    className={`join-item btn ${currentPage === index + 1 ? 'btn-active' : ''}`}
                                    onClick={() => setCurrentPage(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}