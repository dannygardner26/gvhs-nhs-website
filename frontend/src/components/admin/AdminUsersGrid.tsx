"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  ExternalLink,
  Clock,
  Users,
  ChevronUp,
  ChevronDown,
  Key
} from 'lucide-react';

interface UserData {
  user_id: string;
  real_user_id: string;
  decrypted_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  isCheckedIn: boolean;
  checkedInAt: string | null;
  total_hours: number;
  created_at: string;
}

type SortField = 'name' | 'total_hours' | 'created_at';
type SortOrder = 'asc' | 'desc';
type FilterStatus = 'all' | 'checked_in';

interface AdminUsersGridProps {
  onChangePin?: (email: string) => void;
}

export function AdminUsersGrid({ onChangePin }: AdminUsersGridProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/checkin/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user =>
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.user_id.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus === 'checked_in') {
      result = result.filter(user => user.isCheckedIn);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`);
          break;
        case 'total_hours':
          comparison = a.total_hours - b.total_hours;
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [users, searchQuery, filterStatus, sortField, sortOrder]);

  const stats = useMemo(() => ({
    total: users.length,
    checkedIn: users.filter(u => u.isCheckedIn).length
  }), [users]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ?
      <ChevronUp className="w-4 h-4 inline ml-1" /> :
      <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          All NHS Members
        </h2>
        <div className="text-sm text-gray-500">
          {filteredAndSortedUsers.length} of {users.length} users
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card
          className={`cursor-pointer transition-all ${filterStatus === 'all' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Members</div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all ${filterStatus === 'checked_in' ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => setFilterStatus('checked_in')}
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
            <div className="text-sm text-gray-500">Checked In Now</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="all">All Users</option>
                <option value="checked_in">Checked In Now</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  Name <SortIcon field="name" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  User ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                  Library Status
                </th>
                <th
                  className="px-4 py-3 text-center text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('total_hours')}
                >
                  Hours <SortIcon field="total_hours" />
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedUsers.map((user) => (
                <tr key={user.real_user_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${user.decrypted_user_id}/profile`}
                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                    >
                      {user.first_name} {user.last_name}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.user_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {user.isCheckedIn ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        In Library
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                        Not in Library
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-sm font-medium">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {user.total_hours.toFixed(1)}h
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Link href={`/admin/users/${user.decrypted_user_id}/profile`}>
                        <Button size="sm" variant="outline">
                          Profile
                        </Button>
                      </Link>
                      {onChangePin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onChangePin(user.email)}
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No users found matching your criteria</p>
          </div>
        )}
      </Card>
    </div>
  );
}
