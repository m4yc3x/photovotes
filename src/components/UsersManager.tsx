import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Save, X, ArrowLeft, Dices, Copy, Check } from 'lucide-react';
import Link from 'next/link';

interface User {
    id: number;
    name: string;
    key: string;
    role: string;
}

export default function UsersManager() {
    const [users, setUsers] = useState<User[]>([]);
    const [newUser, setNewUser] = useState({ name: '', key: '', role: 'judge' });
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser),
        });
        if (response.ok) {
            setNewUser({ name: '', key: '', role: 'judge' });
            fetchUsers();
        }
    };

    const handleUpdateUser = async (id: number, updatedUser: Partial<User>) => {
        const response = await fetch(`/api/users?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUser),
        });
        if (response.ok) {
            setEditingUser(null);
            fetchUsers();
        }
    };

    const handleDeleteUser = async (id: number) => {
        const response = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
        if (response.ok) fetchUsers();
    };

    const generateRandomKey = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 32; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };

    const copyToClipboard = (text: string, id: number) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const UserSkeleton = () => (
        <div className="card bg-base-100 shadow-xl animate-pulse">
            <div className="card-body">
                <div className="h-6 bg-base-300 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-base-300 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-base-300 rounded w-1/4 mb-4"></div>
                <div className="card-actions justify-end">
                    <div className="h-10 bg-base-300 rounded w-24 mr-2"></div>
                    <div className="h-10 bg-base-300 rounded w-24"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-base-200 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Users Manager</h1>
                    <Link href="/admin/dashboard" className="btn btn-ghost">
                        <ArrowLeft className="mr-2" /> Back to Dashboard
                    </Link>
                </div>
                <div className="card bg-base-100 shadow-xl mb-8">
                    <div className="card-body">
                        <h2 className="card-title text-2xl mb-4"><Plus className="mr-2" /> Add New User</h2>
                        <form onSubmit={handleAddUser} className="flex flex-col gap-4">
                            <input
                                type="text"
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                placeholder="User Name"
                                className="input input-bordered w-full"
                            />
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newUser.key}
                                    onChange={(e) => setNewUser({ ...newUser, key: e.target.value })}
                                    placeholder="User Key"
                                    className="input input-bordered w-full"
                                />
                                <button
                                    type="button"
                                    onClick={() => setNewUser({ ...newUser, key: generateRandomKey() })}
                                    className="btn btn-square btn-outline"
                                >
                                    <Dices className="h-6 w-6" />
                                </button>
                            </div>
                            <select
                                value={newUser.role}
                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                className="select select-bordered w-full"
                            >
                                <option value="judge">Judge</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button type="submit" className="btn btn-primary">
                                <Plus className="mr-2" /> Add User
                            </button>
                        </form>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading
                        ? Array.from({ length: 6 }).map((_, index) => (
                              <UserSkeleton key={index} />
                          ))
                        : users.map((user) => (
                              <div key={user.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                                  <div className="card-body">
                                      {editingUser?.id === user.id ? (
                                          <>
                                              <input
                                                  type="text"
                                                  value={editingUser.name}
                                                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                                  className="input input-bordered w-full mb-2"
                                              />
                                              <div className="flex items-center gap-2 mb-2">
                                                  <input
                                                      type="text"
                                                      value={editingUser.key}
                                                      onChange={(e) => setEditingUser({ ...editingUser, key: e.target.value })}
                                                      className="input input-bordered w-full"
                                                  />
                                                  <button
                                                      type="button"
                                                      onClick={() => setEditingUser({ ...editingUser, key: generateRandomKey() })}
                                                      className="btn btn-square btn-outline"
                                                  >
                                                      <Dices className="h-6 w-6" />
                                                  </button>
                                              </div>
                                              <select
                                                  value={editingUser.role}
                                                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                                  className="select select-bordered w-full mb-4"
                                              >
                                                  <option value="judge">Judge</option>
                                                  <option value="admin">Admin</option>
                                              </select>
                                              <div className="card-actions justify-end">
                                                  <button
                                                      onClick={() => handleUpdateUser(user.id, editingUser)}
                                                      className="btn btn-success btn-sm"
                                                  >
                                                      <Save className="mr-2" /> Save
                                                  </button>
                                                  <button
                                                      onClick={() => setEditingUser(null)}
                                                      className="btn btn-ghost btn-sm"
                                                  >
                                                      <X className="mr-2" /> Cancel
                                                  </button>
                                              </div>
                                          </>
                                      ) : (
                                          <>
                                              <h2 className="card-title text-2xl mb-2">{user.name}</h2>
                                              <div className="flex items-center justify-between mb-2">
                                                  <span className="text-sm font-semibold">Key:</span>
                                                  <div className="flex items-center">
                                                      <span className="text-sm mr-2">{user.key.substring(0, 8)}...</span>
                                                      <button
                                                          onClick={() => copyToClipboard(user.key, user.id)}
                                                          className="btn btn-ghost btn-xs"
                                                      >
                                                          {copiedId === user.id ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                                                      </button>
                                                  </div>
                                              </div>
                                              <p className="mb-4"><span className="font-semibold">Role:</span> {user.role.toUpperCase() == 'ADMIN' ? <span className="text-error">Admin</span> : 'Judge'}</p>
                                              <div className="card-actions justify-end">
                                                  <button
                                                      onClick={() => setEditingUser(user)}
                                                      className="btn btn-primary btn-sm"
                                                  >
                                                      <Edit2 className="mr-2" /> Edit
                                                  </button>
                                                  <button
                                                      onClick={() => handleDeleteUser(user.id)}
                                                      className="btn btn-error btn-sm"
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