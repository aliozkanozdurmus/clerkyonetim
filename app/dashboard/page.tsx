'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  daysLeft: number;
  isLocked: boolean;
}

export default function Dashboard() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDaysLeftChange = async (userId: string, newDaysLeft: number) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/users/${userId}/days-left`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ daysLeft: newDaysLeft }),
      });

      if (!response.ok) {
        throw new Error('Failed to update days left');
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, daysLeft: newDaysLeft } : user
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update days left');
    }
  };

  const handleLockUser = async (userId: string, shouldLock: boolean) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/users/${userId}/lock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isLocked: shouldLock }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user lock status');
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, isLocked: shouldLock } : user
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lock status');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 border-b text-left">Name</th>
              <th className="px-6 py-3 border-b text-left">Email</th>
              <th className="px-6 py-3 border-b text-left">Days Left</th>
              <th className="px-6 py-3 border-b text-left">Status</th>
              <th className="px-6 py-3 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-6 py-4 border-b">{user.email}</td>
                <td className="px-6 py-4 border-b">
                  <input
                    type="number"
                    value={user.daysLeft}
                    onChange={(e) => handleDaysLeftChange(user.id, parseInt(e.target.value))}
                    className="w-20 px-2 py-1 border rounded"
                  />
                </td>
                <td className="px-6 py-4 border-b">
                  {user.isLocked ? 'Locked' : 'Active'}
                </td>
                <td className="px-6 py-4 border-b">
                  <button
                    onClick={() => handleLockUser(user.id, !user.isLocked)}
                    className={`px-3 py-1 rounded ${
                      user.isLocked
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-red-500 hover:bg-red-600'
                    } text-white`}
                  >
                    {user.isLocked ? 'Unlock' : 'Lock'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 