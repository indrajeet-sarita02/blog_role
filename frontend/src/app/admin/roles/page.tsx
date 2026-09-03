'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@/lib/auth/Providers';
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  fetchRolePermissions,
  assignRolePermissions,
  fetchPermissions,
} from '@/lib/api/roles';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { PageLoader } from '@/components/ui/Spinner';
import { extractErrorMessage } from '@/lib/api/client';
import { usePermissions } from '@/hooks/usePermissions';
import { Role } from '@/types';

export default function AdminRolesPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editing, setEditing] = useState<Role | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [permRole, setPermRole] = useState<Role | null>(null);
  const [permSelected, setPermSelected] = useState<number[]>([]);

  const roles = useQuery({ queryKey: ['roles'], queryFn: () => fetchRoles({ limit: '100' }) });
  const permissions = useQuery({
    queryKey: ['permissions'],
    queryFn: () => fetchPermissions({ limit: '100' }),
    enabled: has('permission.view'),
  });
  const rolePerms = useQuery({
    queryKey: ['role-permissions', permRole?.id],
    queryFn: () => fetchRolePermissions(permRole!.id),
    enabled: !!permRole && has('role.view'),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['roles'] });

  const createM = useMutation({
    mutationFn: () => createRole({ name: newName, slug: newSlug, description: newDesc || null }),
    onSuccess: () => {
      setShowCreate(false);
      setNewName('');
      setNewSlug('');
      setNewDesc('');
      setError(null);
      invalidate();
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const updateM = useMutation({
    mutationFn: () => updateRole(editing!.id, { name: editName, description: editDesc || null }),
    onSuccess: () => {
      setEditing(null);
      setError(null);
      invalidate();
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const deleteM = useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: () => invalidate(),
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const assignM = useMutation({
    mutationFn: () => assignRolePermissions(permRole!.id, permSelected),
    onSuccess: () => {
      setPermRole(null);
      setError(null);
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const togglePerm = (id: number) => {
    setPermSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const openPermPanel = (role: Role) => {
    setPermRole(role);
    setPermSelected(rolePerms.data?.map((p) => p.id) ?? []);
  };

  useEffect(() => {
    if (rolePerms.data && permRole) {
      setPermSelected(rolePerms.data.map((p) => p.id));
    }
  }, [rolePerms.data, permRole]);

  const modules = Array.from(new Set(permissions.data?.data.map((p) => p.module) ?? []));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
          <p className="mt-1 text-sm text-gray-500">Manage roles and their permissions.</p>
        </div>
        {has('role.create') && (
          <Button onClick={() => setShowCreate((s) => !s)}>{showCreate ? 'Cancel' : '+ New role'}</Button>
        )}
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      {showCreate && has('role.create') && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create role</CardTitle>
          </CardHeader>
          <CardBody>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                createM.mutate();
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                <Input
                  label="Slug"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                  placeholder="editor"
                  required
                />
              </div>
              <Textarea label="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={2} />
              <Button type="submit" loading={createM.isLoading} disabled={!newName || !newSlug}>
                Create role
              </Button>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All roles</CardTitle>
        </CardHeader>
        <CardBody className="px-0">
          {roles.isLoading ? (
            <PageLoader />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Slug</th>
                    <th className="px-5 py-3 font-medium">Description</th>
                    <th className="px-5 py-3 font-medium">System</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {roles.data?.data.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-gray-500">
                        No roles found.
                      </td>
                    </tr>
                  )}
                  {roles.data?.data.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{role.name}</td>
                      <td className="px-5 py-3">
                        <Badge status={role.slug} />
                      </td>
                      <td className="px-5 py-3 text-gray-500">{role.description || '—'}</td>
                      <td className="px-5 py-3 text-gray-500">{role.isSystem ? 'Yes' : 'No'}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          {has('role.view') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPermPanel(role)}
                            >
                              Permissions
                            </Button>
                          )}
                          {has('role.update') && !role.isSystem && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditing(role);
                                setEditName(role.name);
                                setEditDesc(role.description ?? '');
                              }}
                            >
                              Edit
                            </Button>
                          )}
                          {has('role.delete') && !role.isSystem && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                if (confirm(`Delete role "${role.name}"?`)) deleteM.mutate(role.id);
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
        </CardBody>
      </Card>

      {editing && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Edit role</CardTitle>
          </CardHeader>
          <CardBody>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                updateM.mutate();
              }}
            >
              <Input label="Name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
              <Textarea label="Description" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} />
              <div className="flex gap-2">
                <Button type="submit" loading={updateM.isLoading} disabled={!editName}>
                  Save changes
                </Button>
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {permRole && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Permissions for {permRole.name}</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="mb-4 space-y-5">
              {modules.map((mod) => (
                <div key={mod}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">{mod}</p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {permissions.data?.data
                      .filter((p) => p.module === mod)
                      .map((p) => (
                        <label key={p.id} className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={permSelected.includes(p.id)}
                            onChange={() => togglePerm(p.id)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          {p.name}
                        </label>
                      ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                loading={assignM.isLoading}
                disabled={permSelected.length === 0}
                onClick={() => assignM.mutate()}
              >
                Save permissions
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPermRole(null)}>
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}