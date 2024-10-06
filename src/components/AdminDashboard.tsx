import React, { useState, useEffect } from 'react';
import { Photo } from '../models/Photo';

export default function AdminDashboard() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [newPhoto, setNewPhoto] = useState({ username: '', imageUrl: '' });

    useEffect(() => {
        fetchPhotos();
    }, []);

    const fetchPhotos = async () => {
        const response = await fetch('/api/photos');
        const data = await response.json();
        setPhotos(data);
    };

    const handleAddPhoto = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch('/api/photos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPhoto),
        });
        if (response.ok) {
            setNewPhoto({ username: '', imageUrl: '' });
            fetchPhotos();
        }
    };

    const handleDeletePhoto = async (id: number) => {
        const response = await fetch(`/api/photos?id=${id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            fetchPhotos();
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            
            <form onSubmit={handleAddPhoto} className="mb-8">
                <input
                    type="text"
                    value={newPhoto.username}
                    onChange={(e) => setNewPhoto({ ...newPhoto, username: e.target.value })}
                    placeholder="Username"
                    className="p-2 border rounded mr-2"
                />
                <input
                    type="text"
                    value={newPhoto.imageUrl}
                    onChange={(e) => setNewPhoto({ ...newPhoto, imageUrl: e.target.value })}
                    placeholder="Image URL"
                    className="p-2 border rounded mr-2"
                />
                <button type="submit" className="p-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Add Photo
                </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map((photo) => (
                    <div key={photo.id} className="border p-4 rounded">
                        <img src={photo.imageUrl} alt={photo.username} className="w-full h-48 object-cover mb-2" />
                        <p className="font-bold">{photo.username}</p>
                        <button
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="mt-2 p-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}