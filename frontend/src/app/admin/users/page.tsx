'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@/lib/auth/Providers';
import { fetchUsers, createUser, updateUserRoles, updateUserStatus, deleteUser } from '@/lib/api/auth';
import { fetchRoles } from '@/lib/api/roles';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Pagination } from '@/components/ui/Pagination';
import { PageLoader } from '@/components/ui/Spinner';
import { extractErrorMessage } from '@/lib/api/client';
import { formatDate } from '@/lib/utils/format';
import { usePermissions } from '@/hooks/usePermissions';
import { AccessDenied } from '@/components/guards/AccessDenied';
import { User } from '@/types';

export default function AdminUsersPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRoleIds, setNewRoleIds] = useState<number[]>([]);
  const [editing, setEditing] = useState<User | null>(null);
  const [editRoleIds, setEditRoleIds] = useState<number[]>([]);
  const [rolePanelRoleId, setRolePanelRoleId] = useState<number | null>(null);

  const users = useQuery({
    queryKey: ['users', { page, search, statusFilter }],
    queryFn: () =>
      fetchUsers({
        page: String(page),
        limit: '20',
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      }),
    enabled: has('user.view'),
  });
  const roles = useQuery({
    queryKey: ['roles-options'],
    queryFn: () => fetchRoles({ limit: '100' }),
    enabled: has('role.view'),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users'] });

  const createM = useMutation({
    mutationFn: () => createUser({ name: newName, email: newEmail, password: newPassword, roleIds: newRoleIds }),
    onSuccess: () => {
      setShowCreate(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRoleIds([]);
      setError(null);
      invalidate();
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const rolesM = useMutation({
    mutationFn: ({ userId, roleIds }: { userId: number; roleIds: number[] }) =>
      updateUserRoles(userId, roleIds),
    onSuccess: () => {
      setRolePanelRoleId(null);
      invalidate();
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const statusM = useMutation({
    mutationFn: ({ userId, status }: { userId: number; status: string }) =>
      updateUserStatus(userId, status),
    onSuccess: () => invalidate(),
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const deleteM = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => invalidate(),
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const toggleAuthor = (id: number) => {
    setNewRoleIds((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  };

  if (!has('user.view')) {
    return <AccessDenied />;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">Manage user accounts and roles.</p>
        </div>
        {has('user.create') && (
          <Button onClick={() => setShowCreate((s) => !s)}>{showCreate ? 'Cancel' : '+ New user'}</Button>
        )}
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      {showCreate && has('user.create') && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create user</CardTitle>
          </CardHeader>
          <CardBody>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                createM.mutate();
              }}
            >
              <div className="grid gap-4 md:grid-cols-3">
                <Input label="Name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                <Input label="Email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
                <Input
                  label="Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-gray-700">Roles</p>
                <div className="flex flex-wrap gap-4">
                  {roles.data?.data.map((role) => (
                    <label key={role.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={newRoleIds.includes(role.id)}
                        onChange={() => toggleAuthor(role.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {role.name}
                    </label>
                  ))}
                </div>
              </div>
              <Button type="submit" loading={createM.isLoading} disabled={!newName || !newEmail || !newPassword}>
                Create user
              </Button>
            </form>
          </CardBody>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="max-w-sm flex-1">
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="w-40"
          options={[
            { value: '', label: 'All statuses' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'suspended', label: 'Suspended' },
            { value: 'pending', label: 'Pending' },
          ]}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
        </CardHeader>
        <CardBody className="px-0">
          {users.isLoading ? (
            <PageLoader />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Roles</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.data?.data.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  )}
                  {users.data?.data.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{user.name}</td>
                      <td className="px-5 py-3 text-gray-500">{user.email}</td>
                      <td className="px-5 py-3">
                        <Badge status={user.status} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.roles?.map((role) => <Badge key={role.id} status={role.slug} />)}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          {has('user.update') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (rolePanelRoleId === user.id) {
                                  setRolePanelRoleId(null);
                                } else {
                                  setEditing(user);
                                  setEditRoleIds(user.roles?.map((r) => r.id) ?? []);
                                  setRolePanelRoleId(user.id);
                                }
                              }}
                            >
                              Roles
                            </Button>
                          )}
                          {has('user.update') && (
                            <Select
                              className="w-32"
                              value=""
                              onChange={(e) => {
                                if (e.target.value) statusM.mutate({ userId: user.id, status: e.target.value });
                              }}
                              options={[
                                { value: '', label: 'Status…' },
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                                { value: 'suspended', label: 'Suspended' },
                                { value: 'pending', label: 'Pending' },
                              ]}
                            />
                          )}
                          {has('user.delete') && user.status !== 'suspended' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                if (confirm(`Delete "${user.name}"?`)) deleteM.mutate(user.id);
                              }}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {rolePanelRoleId && editing && (
            <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
              <p className="mb-2 text-sm font-semibold text-gray-900">Roles for {editing.name}</p>
              <div className="mb-3 flex flex-wrap gap-4">
                {roles.data?.data.map((role) => (
                  <label key={role.id} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={editRoleIds.includes(role.id)}
                      onChange={() =>
                        setEditRoleIds((prev) =>
                          prev.includes(role.id) ? prev.filter((r) => r !== role.id) : [...prev, role.id],
                        )
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {role.name}
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={editRoleIds.length === 0}
                  loading={rolesM.isLoading}
                  onClick={() => rolesM.mutate({ userId: editing.id, roleIds: editRoleIds })}
                >
                  Save roles
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setRolePanelRoleId(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {users.data?.meta && (
            <div className="px-5 pb-4">
              <Pagination meta={users.data.meta} onPageChange={setPage} />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}